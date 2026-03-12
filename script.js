document.addEventListener('DOMContentLoaded', async () => {
    // Supabase Configuration
    const SUPABASE_URL = 'https://seygibnfctxekswrhljl.supabase.co';
    const SUPABASE_KEY = 'sb_publishable_53FavZzc64XlKvNXsg1UGA_opE6xsDP';
    const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

    // Header Scroll Effect
    const header = document.querySelector('header');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });

    // Intersection Observer for Reveal Animations
    const observerOptions = {
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
            }
        });
    }, observerOptions);

    document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

    // Smooth Scroll for Nav Links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth'
                });
            }
        });
    });

    // Form Handling with Formspree
    const form = document.querySelector('#registration-form');
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const btn = form.querySelector('button');
            const originalText = btn.innerText;

            // Show loading state
            btn.innerText = 'Enviando...';
            btn.disabled = true;

            const formData = new FormData(form);

            try {
                const response = await fetch(form.action, {
                    method: 'POST',
                    body: formData,
                    headers: {
                        'Accept': 'application/json'
                    }
                });

                if (response.ok) {
                    btn.innerText = '¡Enviado con éxito!';
                    btn.style.background = '#00ff88';
                    btn.style.color = '#000';
                    form.reset();

                    setTimeout(() => {
                        btn.innerText = originalText;
                        btn.style.background = '';
                        btn.style.color = '';
                        btn.disabled = false;
                    }, 5000);
                } else {
                    throw new Error('Error en el servidor');
                }
            } catch (error) {
                btn.innerText = 'Error al enviar';
                btn.style.background = '#ff4444';

                setTimeout(() => {
                    btn.innerText = originalText;
                    btn.style.background = '';
                    btn.disabled = false;
                }, 3000);
            }
        });
    }
    // UI Elements
    const commentsDisplay = document.querySelector('#comments-display');
    const commentText = document.querySelector('#comment-text');
    const btnPublicar = document.querySelector('#btn-publicar');
    const commentMsgContainer = document.querySelector('#comment-msg-container');

    const authNavItem = document.querySelector('#auth-nav-item');
    const profileNavItem = document.querySelector('#profile-nav-item');
    const logoutBtn = document.querySelector('#logout-btn');
    const openAuthBtn = document.querySelector('#open-auth-btn');

    if (openAuthBtn) {
        openAuthBtn.onclick = (e) => {
            // let normal href navigate to auth.html if it exists
        };
    }

    const displayMsg = (elementId, msg, type) => {
        const el = document.getElementById(elementId);
        if (!el) return;
        el.innerText = msg;
        el.className = `success ${type}`;
        el.style.display = 'block';
        el.style.color = type === 'error' ? '#ff4444' : '#00ff88';
        setTimeout(() => el.style.display = 'none', 5000);
    };

    // Funciones Globales requeridas
    window.obtenerComentarios = async () => {
        if (!commentsDisplay) return;
        
        try {
            const { data: sessionData } = await supabase.auth.getSession();
            if (!sessionData.session) {
                commentsDisplay.innerHTML = `
                <div style="text-align: center; color: var(--text-main); padding: 4rem 2rem; background: var(--glass-bg); border: 1px solid var(--glass-border); border-radius: 24px; backdrop-filter: blur(10px);">
                    <div style="font-size: 4rem; margin-bottom: 1.5rem; color: var(--primary-color);">🔒</div>
                    <h3 style="font-size: 1.8rem; margin-bottom: 1rem;">Únete a la conversación</h3>
                    <p style="color: var(--text-muted); margin-bottom: 2rem; font-size: 1.1rem;">Inicia sesión para ver y escribir comentarios</p>
                    <div style="display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap;">
                        <a href="auth.html" class="btn btn-primary" style="padding: 0.8rem 2rem; text-decoration: none;">Iniciar sesión</a>
                        <a href="auth.html" class="btn btn-outline" style="padding: 0.8rem 2rem; text-decoration: none;">Registrarse gratis</a>
                    </div>
                </div>`;
                return;
            }

            const { data: comments, error } = await supabase
                .from('comments')
                .select('*')
                .order('created_at', { ascending: false })
                .limit(50);
                
            if (error) throw error;
            
            if (!comments || comments.length === 0) {
                commentsDisplay.innerHTML = `<div style="text-align:center;color:var(--text-muted);padding:3rem;">Aun no hay comentarios. ¡Sé el primero!</div>`;
                return;
            }
            
            commentsDisplay.innerHTML = comments.map(c => {
                const fechaFormat = new Date(c.created_at).toLocaleString('es-ES', {
                    day: '2-digit', month: '2-digit', year: 'numeric',
                    hour: '2-digit', minute: '2-digit'
                });
                return `
                    <div class="comment-card">
                        <div class="comment-header">
                            <span class="comment-author">Usuario Autorizado</span>
                            <span class="comment-date">${fechaFormat}</span>
                        </div>
                        <p class="comment-body">${c.contenido}</p>
                    </div>
                `;
            }).join('');
        } catch (error) {
            console.error(error);
            commentsDisplay.innerHTML = `<p style="text-align:center;color:#ff4444;">Error al cargar comentarios.</p>`;
        }
    };

    window.publicarComentario = async (contenido) => {
        if (btnPublicar) {
            btnPublicar.disabled = true;
            btnPublicar.innerText = 'Publicando...';
        }
        
        try {
            const { data: sessionData } = await supabase.auth.getSession();
            if (!sessionData.session) throw new Error('Debes iniciar sesión para poder comentar.');
            
            const { error } = await supabase.from('comments').insert([{ 
                user_id: sessionData.session.user.id, 
                contenido: contenido 
            }]);
            
            if (error) throw error;
            
            document.getElementById('comment-form').reset();
            await window.obtenerComentarios();
            
            if (btnPublicar) {
                btnPublicar.innerText = '¡Publicado!';
                btnPublicar.style.background = '#00ff88'; 
                btnPublicar.style.color = '#000';
            }
        } catch (error) {
            console.error(error);
            alert(error.message);
            if (btnPublicar) {
                btnPublicar.innerText = 'Error';
                btnPublicar.style.background = '#ff4444';
            }
        } finally {
            setTimeout(() => {
                if (btnPublicar) {
                    btnPublicar.innerText = 'Publicar Comentario';
                    btnPublicar.style.background = ''; 
                    btnPublicar.style.color = '';
                    btnPublicar.disabled = false;
                }
            }, 2000);
        }
    };

    window.registrarUsuario = async (email, password) => {
        const btn = document.querySelector('#form-register button') || document.querySelector('#register-form-auth button');
        if (btn) { btn.disabled = true; btn.innerText = 'Creando...'; }
        
        try {
            const { error } = await supabase.auth.signUp({ email, password });
            if (error) throw error;
            
            displayMsg('register-message', 'Revisa tu correo electrónico para verificar tu cuenta antes de iniciar sesión.', 'success');
            const form = document.querySelector('#form-register form') || document.getElementById('register-form-auth');
            if(form) form.reset();
        } catch (error) {
            displayMsg('register-message', error.message, 'error');
        } finally {
            if (btn) { btn.disabled = false; btn.innerText = 'Registrarse'; }
        }
    };

    window.iniciarSesion = async (email, password) => {
        const btn = document.querySelector('#form-login button') || document.querySelector('#login-form button');
        if(btn) { btn.disabled = true; btn.innerText = 'Ingresando...'; }
        
        try {
            const { error } = await supabase.auth.signInWithPassword({ email, password });
            if (error) {
                if(error.message.includes('Email not confirmed')) {
                     throw new Error('Debes verificar tu correo electrónico antes de iniciar sesión.');
                }
                throw error;
            }
            
            displayMsg('login-message', '¡Bienvenido! Haz iniciado sesión.', 'success');
            const form = document.querySelector('#form-login form') || document.getElementById('login-form');
            if(form) form.reset();
            
            // Redirect to index.html after short delay
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 800);
            
        } catch (error) {
            displayMsg('login-message', error.message, 'error');
        } finally {
            if(btn) { btn.disabled = false; btn.innerText = 'Iniciar sesión'; }
        }
    };

    window.cerrarSesion = async () => {
        await supabase.auth.signOut();
    };

    if (logoutBtn) {
        logoutBtn.onclick = async (e) => {
            e.preventDefault();
            await window.cerrarSesion();
        };
    }

    // Actualizar vista según autenticación
    const updateAuthUI = (user) => {
        const btnLoginRedirect = document.getElementById('btn-login-redirect');
        const commentOverlay = document.getElementById('comment-overlay');
        
        if (user) {
            if (authNavItem) authNavItem.style.display = 'none';
            if (profileNavItem) {
                profileNavItem.style.display = 'block';
                profileNavItem.querySelector('a').innerText = `👤 ${user.email}`;
            }
            
            // Habilitar sección de comentarios
            if (commentOverlay) commentOverlay.style.display = 'none';
            if (commentText) {
                commentText.disabled = false;
                commentText.placeholder = 'Escribe tu comentario aquí...';
            }
            if (btnPublicar) {
                btnPublicar.disabled = false;
                btnPublicar.style.display = 'block';
            }
            if (commentMsgContainer) {
                commentMsgContainer.style.display = 'none';
            }
            if (btnLoginRedirect) btnLoginRedirect.style.display = 'none';
            
            // Si estamos en auth.html y ya hay sesión
            if (window.location.pathname.includes('auth.html')) {
                window.location.href = 'index.html';
            }
            
        } else {
            if (authNavItem) authNavItem.style.display = 'block';
            if (profileNavItem) profileNavItem.style.display = 'none';
            
            // Bloquear sección de comentarios
            if (commentOverlay) commentOverlay.style.display = 'flex';
            if (commentText) {
                commentText.disabled = true;
                commentText.placeholder = 'Inicia sesión para escribir un comentario...';
            }
            if (btnPublicar) btnPublicar.style.display = 'none';
            if (commentMsgContainer) {
                commentMsgContainer.style.display = 'none';
            }
            
            if (btnLoginRedirect) btnLoginRedirect.style.display = 'none';
            
            // Show friendly CTA directly in comments display if we are on index
            if (commentsDisplay && !window.location.pathname.includes('auth.html')) {
                commentsDisplay.innerHTML = `
                <div style="text-align: center; color: var(--text-main); padding: 4rem 2rem; background: var(--glass-bg); border: 1px solid var(--glass-border); border-radius: 24px; backdrop-filter: blur(10px);">
                    <div style="font-size: 4rem; margin-bottom: 1.5rem; color: var(--primary-color);">🔒</div>
                    <h3 style="font-size: 1.8rem; margin-bottom: 1rem;">Únete a la conversación</h3>
                    <p style="color: var(--text-muted); margin-bottom: 2rem; font-size: 1.1rem;">Inicia sesión para ver y escribir comentarios</p>
                    <div style="display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap;">
                        <a href="auth.html" class="btn btn-primary" style="padding: 0.8rem 2rem; text-decoration: none;">Iniciar sesión</a>
                        <a href="auth.html" class="btn btn-outline" style="padding: 0.8rem 2rem; text-decoration: none;">Registrarse gratis</a>
                    </div>
                </div>`;
            }
        }
    };

    // Suscribirse a cambios de sesión
    supabase.auth.onAuthStateChange((event, session) => {
        updateAuthUI(session?.user);
    });

    // Sesión inicial y carga de comentarios
    supabase.auth.getSession().then(({ data: { session } }) => {
        updateAuthUI(session?.user);
        window.obtenerComentarios();
    });
});
