import { forwardRef, useImperativeHandle, useRef } from 'react';
import { Turnstile, type TurnstileInstance } from '@marsidev/react-turnstile';

export interface TurnstileCaptchaProps {
  onVerify: (token: string) => void;
  onExpire: () => void;
  onError: () => void;
}

export interface TurnstileCaptchaRef {
  reset: () => void;
}

const siteKey = import.meta.env.VITE_TURNSTILE_SITE_KEY;
const isTestSiteKey = typeof siteKey === 'string' && siteKey.startsWith('1x');

export const TurnstileCaptcha = forwardRef<TurnstileCaptchaRef, TurnstileCaptchaProps>(
  ({ onVerify, onExpire, onError }, ref) => {
    const turnstileRef = useRef<TurnstileInstance>(null);

    useImperativeHandle(ref, () => ({
      reset: () => {
        turnstileRef.current?.reset();
      },
    }));

    if (!siteKey) {
      // #region agent log
      fetch('http://127.0.0.1:7304/ingest/20b01933-ba4f-418f-881b-434a9d7e19c8',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'2d335f'},body:JSON.stringify({sessionId:'2d335f',location:'TurnstileCaptcha.tsx:missingKey',message:'siteKey missing',data:{hasSiteKey:false},timestamp:Date.now(),hypothesisId:'H2'})}).catch(()=>{});
      // #endregion
      console.error('VITE_TURNSTILE_SITE_KEY no está configurada');
      return (
        <p className="text-xs text-red-200 text-center">
          Verificación de seguridad no disponible. Contacta al administrador.
        </p>
      );
    }

    // #region agent log
    fetch('http://127.0.0.1:7304/ingest/20b01933-ba4f-418f-881b-434a9d7e19c8',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'2d335f'},body:JSON.stringify({sessionId:'2d335f',location:'TurnstileCaptcha.tsx:render',message:'widget rendering',data:{hasSiteKey:true,isTestSiteKey,keyPrefix:siteKey.slice(0,4)},timestamp:Date.now(),hypothesisId:'H1'})}).catch(()=>{});
    // #endregion

    const handleVerify = (token: string) => {
      // #region agent log
      fetch('http://127.0.0.1:7304/ingest/20b01933-ba4f-418f-881b-434a9d7e19c8',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'2d335f'},body:JSON.stringify({sessionId:'2d335f',location:'TurnstileCaptcha.tsx:onSuccess',message:'turnstile verified',data:{tokenLength:token.length,isTestSiteKey},timestamp:Date.now(),hypothesisId:'H3'})}).catch(()=>{});
      // #endregion
      onVerify(token);
    };

    return (
      <div className="flex justify-center">
        <Turnstile
          ref={turnstileRef}
          siteKey={siteKey}
          onSuccess={handleVerify}
          onExpire={onExpire}
          onError={() => {
            // #region agent log
            fetch('http://127.0.0.1:7304/ingest/20b01933-ba4f-418f-881b-434a9d7e19c8',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'2d335f'},body:JSON.stringify({sessionId:'2d335f',location:'TurnstileCaptcha.tsx:onError',message:'turnstile error',data:{isTestSiteKey},timestamp:Date.now(),hypothesisId:'H3'})}).catch(()=>{});
            // #endregion
            onError();
          }}
          options={{ theme: 'dark', size: 'normal' }}
        />
      </div>
    );
  }
);

TurnstileCaptcha.displayName = 'TurnstileCaptcha';
