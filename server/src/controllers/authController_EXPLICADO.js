// ============================================================================
// MECANISMO DE VERIFICACIÓN DE EMAIL - EXPLICACIÓN PASO A PASO
// ============================================================================
// Este controlador maneja la verificación de email mediante tokens.
// El flujo completo se explica en cada paso con comentarios detallados.

// Verificar email (2FA)
export const verifyEmail = async (req, res) => {
    try {
        // ====================================================================
        // PASO 1: OBTENER Y VALIDAR EL TOKEN DE LA URL
        // ====================================================================
        // El token viene en la query string de la URL:
        // Ejemplo: /verificar-email?token=abc123xyz...
        let { token } = req.query;

        // Validación inicial: Si no hay token, terminamos inmediatamente
        if (!token) {
            return sendError(res, 'Token de verificación requerido');
        }

        // ====================================================================
        // PASO 2: DECODIFICAR EL TOKEN (si está codificado en la URL)
        // ====================================================================
        // Los tokens pueden venir codificados en la URL (ej: %2B, %2F, etc.)
        // decodeURIComponent() convierte "%2B" de vuelta a "+"
        // Si falla la decodificación, usamos el token original
        try {
            token = decodeURIComponent(token);
        } catch (e) {
            console.warn('Error al decodificar token, usando token original:', e.message);
        }

        console.log('🔍 Verificando token:', token.substring(0, 10) + '...');

        // ====================================================================
        // PASO 3: BUSCAR TOKEN VÁLIDO (no usado y no expirado)
        // ====================================================================
        // Token.findValid() busca en la BD un token que cumpla TODAS estas condiciones:
        // 1. El token coincide exactamente
        // 2. El tipo es 'email_verification'
        // 3. used = FALSE (no ha sido usado)
        // 4. expires_at > NOW() (no ha expirado)
        //
        // Si encuentra un token válido, retorna un objeto con:
        // - id, user_id, token, type, expires_at, used, created_at
        // - email, full_name, email_verified (del usuario asociado)
        //
        // Si NO encuentra un token válido, retorna null
        const tokenData = await Token.findValid(token, 'email_verification');
        
        // ====================================================================
        // PASO 4: SI NO HAY TOKEN VÁLIDO, INVESTIGAR POR QUÉ
        // ====================================================================
        // Si tokenData es null, puede ser porque:
        // - El token no existe en la BD
        // - El token ya fue usado (used = TRUE)
        // - El token expiró (expires_at < NOW())
        //
        // Necesitamos hacer una consulta más amplia para saber exactamente qué pasó
        // y dar un mensaje de error más específico al usuario
        if (!tokenData) {
            // Consulta SQL que busca el token SIN importar si está usado o expirado
            // Esto nos permite saber el estado real del token
            const sql = `
                SELECT t.id, t.user_id, t.token, t.type, t.expires_at, t.used, t.created_at,
                       u.email, u.full_name, u.email_verified
                FROM tokens_verificacion t
                JOIN usuarios u ON t.user_id = u.id
                WHERE t.token = ? AND t.type = ?
            `;
            const result = await query(sql, [token, 'email_verification']);
            
            // Si encontramos el token en la BD (aunque esté usado/expirado)
            if (result[0]) {
                const tokenInfo = result[0];
                
                // ============================================================
                // PRIORIDAD 1: VERIFICAR SI EL EMAIL YA ESTÁ VERIFICADO
                // ============================================================
                // Esta es la verificación más importante porque:
                // - Si el email ya está verificado, el usuario ya puede hacer login
                // - No importa si el token está usado o expirado
                // - Evitamos confundir al usuario con mensajes de error innecesarios
                if (tokenInfo.email_verified) {
                    console.log('ℹ️ Email ya está verificado para usuario ID:', tokenInfo.user_id);
                    // Retornamos éxito porque el objetivo (email verificado) ya se cumplió
                    return sendSuccess(res, 'Tu email ya está verificado', { already_verified: true });
                }
                
                // ============================================================
                // PRIORIDAD 2: VERIFICAR SI EL TOKEN YA FUE USADO
                // ============================================================
                // Si el token fue usado pero el email NO está verificado:
                // - Algo salió mal en una verificación anterior
                // - El usuario necesita un nuevo token
                if (tokenInfo.used) {
                    console.log('❌ Token ya fue usado y email no verificado');
                    return sendError(res, 'Este token ya fue utilizado. Solicita un nuevo enlace de verificación.');
                }
                
                // ============================================================
                // PRIORIDAD 3: VERIFICAR SI EL TOKEN EXPIRÓ
                // ============================================================
                // Si el token expiró y el email NO está verificado:
                // - El usuario tardó más de 24 horas en hacer clic
                // - Necesita solicitar un nuevo enlace de verificación
                if (new Date(tokenInfo.expires_at) < new Date()) {
                    console.log('❌ Token expirado y email no verificado');
                    return sendError(res, 'El token ha expirado. Solicita un nuevo enlace de verificación.');
                }
            }
            
            // ============================================================
            // CASO: TOKEN NO EXISTE EN LA BASE DE DATOS
            // ============================================================
            // Si llegamos aquí, el token no existe en la BD
            // Puede ser un token inválido, malformado, o de otro sistema
            console.log('❌ Token no encontrado');
            return sendError(res, 'Token inválido o expirado');
        }

        // ====================================================================
        // PASO 5: TOKEN VÁLIDO ENCONTRADO - VERIFICAR ESTADO DEL EMAIL
        // ====================================================================
        // Si llegamos aquí, significa que:
        // - El token existe en la BD
        // - El token NO ha sido usado (used = FALSE)
        // - El token NO ha expirado (expires_at > NOW())
        //
        // Ahora verificamos si el email ya está verificado (por si acaso)
        if (tokenData.email_verified) {
            // Caso raro: Token válido pero email ya verificado
            // Puede pasar si el usuario verificó con otro token antes
            console.log('ℹ️ Email ya está verificado para usuario ID:', tokenData.user_id);
            // Marcamos el token como usado para evitar reutilización
            await Token.markAsUsed(token);
            // Retornamos éxito porque el email ya está verificado
            return sendSuccess(res, 'Email ya estaba verificado', { already_verified: true });
        }

        // ====================================================================
        // PASO 6: VERIFICAR EL EMAIL (CASO EXITOSO)
        // ====================================================================
        // Si llegamos aquí, tenemos:
        // - Token válido (no usado, no expirado)
        // - Email NO verificado
        //
        // Procedemos a verificar el email del usuario
        console.log('✅ Token válido para usuario ID:', tokenData.user_id);
        
        // Actualizar el campo email_verified a TRUE en la tabla usuarios
        // Esto permite que el usuario pueda hacer login
        await Usuario.verifyEmail(tokenData.user_id);
        
        // Marcar el token como usado para evitar que se reutilice
        // Esto es importante por seguridad: cada token solo se usa una vez
        await Token.markAsUsed(token);
        
        console.log('✅ Email verificado exitosamente para usuario ID:', tokenData.user_id);

        // Retornar éxito al frontend
        sendSuccess(res, 'Email verificado exitosamente');
        
    } catch (error) {
        // ====================================================================
        // MANEJO DE ERRORES INESPERADOS
        // ====================================================================
        // Si ocurre cualquier error no previsto (error de BD, red, etc.)
        console.error('❌ Error en verificación de email:', error);
        sendError(res, 'Error al verificar email', null, 500);
    }
};

// ============================================================================
// RESUMEN DEL FLUJO DE DECISIÓN
// ============================================================================
//
// 1. ¿Hay token en la URL?
//    NO → Error: "Token requerido"
//    SÍ → Continuar
//
// 2. ¿Token existe y es válido? (no usado, no expirado)
//    NO → Ir a paso 3
//    SÍ → Ir a paso 4
//
// 3. ¿Token existe en BD? (aunque esté usado/expirado)
//    NO → Error: "Token inválido"
//    SÍ → Verificar:
//         a) ¿Email verificado? → Éxito: "Email ya verificado"
//         b) ¿Token usado? → Error: "Token usado, solicita nuevo"
//         c) ¿Token expirado? → Error: "Token expirado, solicita nuevo"
//
// 4. ¿Email ya verificado?
//    SÍ → Marcar token usado → Éxito: "Email ya verificado"
//    NO → Verificar email → Marcar token usado → Éxito: "Email verificado"
//
// ============================================================================
