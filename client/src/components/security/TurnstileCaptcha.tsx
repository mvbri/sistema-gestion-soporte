import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { Turnstile, type TurnstileInstance } from '@marsidev/react-turnstile';
import api from '../../utils/api';

export interface TurnstileCaptchaProps {
  onVerify: (token: string) => void;
  onExpire: () => void;
  onError: () => void;
}

export interface TurnstileCaptchaRef {
  reset: () => void;
}

/** Disponible en build si VITE_TURNSTILE_SITE_KEY estuvo en el entorno de Vite al compilar. */
const buildTimeSiteKey = import.meta.env.VITE_TURNSTILE_SITE_KEY as string | undefined;

async function resolveTurnstileSiteKey(): Promise<string | null> {
  const fromBuild = buildTimeSiteKey?.trim();
  if (fromBuild) {
    return fromBuild;
  }

  const response = await api.get<{ success: boolean; data?: { turnstileSiteKey?: string | null } }>(
    '/auth/public-config'
  );
  const fromApi = response.data?.data?.turnstileSiteKey?.trim();
  return fromApi || null;
}

export const TurnstileCaptcha = forwardRef<TurnstileCaptchaRef, TurnstileCaptchaProps>(
  ({ onVerify, onExpire, onError }, ref) => {
    const turnstileRef = useRef<TurnstileInstance>(null);
    const [siteKey, setSiteKey] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [loadFailed, setLoadFailed] = useState(false);
    const [widgetErrorCode, setWidgetErrorCode] = useState<string | null>(null);

    useImperativeHandle(ref, () => ({
      reset: () => {
        turnstileRef.current?.reset();
      },
    }));

    useEffect(() => {
      let cancelled = false;

      resolveTurnstileSiteKey()
        .then((key) => {
          if (cancelled) {
            return;
          }

          if (key) {
            setSiteKey(key);
            setLoadFailed(false);
            return;
          }

          setLoadFailed(true);
          console.error('VITE_TURNSTILE_SITE_KEY y TURNSTILE_SITE_KEY no están configuradas');
        })
        .catch((error) => {
          if (cancelled) {
            return;
          }

          setLoadFailed(true);
          console.error('Error al cargar configuración de Turnstile:', error);
        })
        .finally(() => {
          if (!cancelled) {
            setLoading(false);
          }
        });

      return () => {
        cancelled = true;
      };
    }, []);

    if (loading) {
      return (
        <p className="text-xs text-gray-300 text-center" aria-live="polite">
          Cargando verificación de seguridad…
        </p>
      );
    }

    if (loadFailed || !siteKey) {
      return (
        <p className="text-xs text-red-200 text-center">
          Verificación de seguridad no disponible. Contacta al administrador.
        </p>
      );
    }

    const handleTurnstileError = (errorCode?: string) => {
      const code = errorCode ?? 'unknown';

      setWidgetErrorCode(code);
      onError();
    };

    const widgetErrorMessage = (() => {
      if (widgetErrorCode === '110200') {
        return `Dominio no autorizado en Cloudflare Turnstile. Añade "${window.location.hostname}" en Hostname Management del widget.`;
      }
      if (widgetErrorCode === '200500') {
        return 'No se pudo conectar con Cloudflare. Comprueba tu red, VPN o bloqueadores de anuncios.';
      }
      if (widgetErrorCode && widgetErrorCode !== 'unknown') {
        return `Error de verificación Cloudflare (código ${widgetErrorCode}). Revisa la configuración del widget.`;
      }
      return null;
    })();

    return (
      <div className="flex flex-col items-center gap-2">
        <Turnstile
          ref={turnstileRef}
          siteKey={siteKey}
          onSuccess={onVerify}
          onExpire={onExpire}
          onError={(code) => handleTurnstileError(code)}
          options={{
            theme: 'dark',
            size: 'normal',
          }}
        />
        {widgetErrorMessage && (
          <p className="text-xs text-amber-200 text-center max-w-sm">{widgetErrorMessage}</p>
        )}
      </div>
    );
  }
);

TurnstileCaptcha.displayName = 'TurnstileCaptcha';
