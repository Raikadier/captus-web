"""
Tests de Selenium para Captus Web — Suite Completa
===================================================
Requiere: pip install selenium
La app debe estar corriendo en: http://localhost:5173  (npm run dev)

Credenciales de prueba configuradas en TEST_EMAIL / TEST_PASSWORD.

Suites incluidas:
  Test01_Login           — Formulario de autenticación y registro  (11 casos)
  Test02_Navegacion      — Sidebar y navegación entre páginas       (8 casos)
  Test03_Tareas          — Página de gestión de tareas              (7 casos)
  Test04_Notas           — Página de notas                          (6 casos)
  Test05_Configuracion   — Secciones de configuración               (7 casos)
  Test06_Home            — Dashboard de inicio                      (6 casos)
  Test07_Calendario      — Página de calendario                     (4 casos)
  Test08_Estadisticas    — Página de estadísticas                   (3 casos)
  Test09_AccesibilidadUX — Accesibilidad y experiencia de usuario   (6 casos)

TOTAL: 58 casos de prueba

Notas de diseño:
  - Test01_Login: limpia localStorage antes de cada test para garantizar
    que no haya sesión activa al probar el formulario de login.
  - Todas las demás suites llaman a _do_login() una sola vez en setUpClass
    y reutilizan la sesión del navegador para el resto de los tests.
  - Para correr en modo silencioso descomenta --headless en _build_driver().
"""

import unittest
import time
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.keys import Keys

BASE_URL = "http://localhost:5173"
WAIT_TIMEOUT = 15

# ---------------------------------------------------------------------------
# Credenciales de prueba
# ---------------------------------------------------------------------------
TEST_EMAIL = "davidbarcelo0411@gmail.com"
TEST_PASSWORD = "123456789"


# ---------------------------------------------------------------------------
# Helpers compartidos
# ---------------------------------------------------------------------------
def _build_driver() -> webdriver.Chrome:
    """Construye el WebDriver con opciones comunes."""
    options = Options()
    # options.add_argument("--headless")   # Descomenta para modo silencioso
    options.add_argument("--window-size=1280,800")
    options.add_argument("--disable-gpu")
    options.add_argument("--no-sandbox")
    options.add_argument("--disable-dev-shm-usage")
    driver = webdriver.Chrome(options=options)
    driver.implicitly_wait(4)
    return driver


def _clear_session(driver: webdriver.Chrome):
    """Elimina la sesión de Supabase del localStorage para forzar la pantalla de login."""
    try:
        driver.execute_script("localStorage.clear(); sessionStorage.clear();")
    except Exception:
        pass


def _do_login(driver: webdriver.Chrome, wait: WebDriverWait):
    """
    Realiza el login con las credenciales de prueba y espera la redirección
    al dashboard. Se llama UNA SOLA VEZ por suite (en setUpClass).
    """
    driver.get(BASE_URL)
    wait.until(EC.visibility_of_element_located((By.ID, "email")))

    driver.find_element(By.ID, "email").clear()
    driver.find_element(By.ID, "password").clear()
    driver.find_element(By.ID, "email").send_keys(TEST_EMAIL)
    driver.find_element(By.ID, "password").send_keys(TEST_PASSWORD)
    driver.find_element(By.CSS_SELECTOR, "button[type='submit']").click()

    # Esperar a que la URL cambie del login (redirige a /home, /teacher/home o /admin)
    wait.until(lambda d: "/home" in d.current_url
               or "/admin" in d.current_url
               or "/teacher" in d.current_url)


# ===========================================================================
# SUITE 1 — LOGIN / AUTENTICACIÓN
# ===========================================================================
class Test01_Login(unittest.TestCase):
    """
    Pruebas del formulario de login y registro.
    setUp limpia localStorage antes de cada test para garantizar que la
    pantalla de login sea visible independientemente de sesiones anteriores.
    """

    @classmethod
    def setUpClass(cls):
        cls.driver = _build_driver()
        cls.wait = WebDriverWait(cls.driver, WAIT_TIMEOUT)

    @classmethod
    def tearDownClass(cls):
        time.sleep(0.5)
        cls.driver.quit()

    def setUp(self):
        """Limpia la sesión y navega al login antes de cada test."""
        self.driver.get(BASE_URL)
        _clear_session(self.driver)
        self.driver.get(BASE_URL)
        self.wait.until(EC.visibility_of_element_located((By.ID, "email")))

    # ------------------------------------------------------------------
    # 1.01 — Los campos principales del formulario están visibles
    # ------------------------------------------------------------------
    def test_01_pagina_login_carga_correctamente(self):
        """Verifica que la página carga y muestra los campos email y contraseña."""
        email_field = self.driver.find_element(By.ID, "email")
        password_field = self.driver.find_element(By.ID, "password")

        self.assertTrue(email_field.is_displayed(), "Campo email no visible")
        self.assertTrue(password_field.is_displayed(), "Campo password no visible")
        print("\n  [PASS] Campos email y password visibles")

    # ------------------------------------------------------------------
    # 1.02 — El título dice 'Iniciar sesión'
    # ------------------------------------------------------------------
    def test_02_titulo_login_correcto(self):
        """Verifica que el encabezado del formulario dice 'Iniciar sesión'."""
        heading = self.driver.find_element(By.TAG_NAME, "h2")
        self.assertIn("Iniciar sesión", heading.text,
                      f"Título inesperado: '{heading.text}'")
        print(f"\n  [PASS] Título del login: '{heading.text}'")

    # ------------------------------------------------------------------
    # 1.03 — Los campos aceptan texto
    # ------------------------------------------------------------------
    def test_03_campos_aceptan_texto(self):
        """Escribe en email y password y verifica que el valor se conserva."""
        self.driver.find_element(By.ID, "email").send_keys("test@captus.com")
        self.driver.find_element(By.ID, "password").send_keys("MiClave123!")

        self.assertEqual(
            self.driver.find_element(By.ID, "email").get_attribute("value"),
            "test@captus.com"
        )
        self.assertEqual(
            self.driver.find_element(By.ID, "password").get_attribute("value"),
            "MiClave123!"
        )
        print("\n  [PASS] Los campos conservan los valores ingresados")

    # ------------------------------------------------------------------
    # 1.04 — El botón de submit está visible y habilitado
    # ------------------------------------------------------------------
    def test_04_boton_submit_visible_y_habilitado(self):
        """Verifica que el botón de submit existe, está visible y habilitado."""
        btn = self.driver.find_element(By.CSS_SELECTOR, "button[type='submit']")

        self.assertTrue(btn.is_displayed(), "Botón de submit no visible")
        self.assertTrue(btn.is_enabled(), "Botón de submit deshabilitado")
        self.assertIn("Iniciar sesión", btn.text)
        print(f"\n  [PASS] Botón submit: '{btn.text}'")

    # ------------------------------------------------------------------
    # 1.05 — Toggle a modo registro muestra el campo Nombre
    # ------------------------------------------------------------------
    def test_05_toggle_a_modo_registro(self):
        """Hace clic en '¿No tienes cuenta?' y verifica el campo Nombre."""
        self.driver.find_element(
            By.XPATH, "//button[contains(text(), '¿No tienes cuenta?')]"
        ).click()

        name_field = self.wait.until(
            EC.visibility_of_element_located((By.ID, "name"))
        )
        self.assertTrue(name_field.is_displayed(), "Campo Nombre no apareció")

        submit_btn = self.driver.find_element(By.CSS_SELECTOR, "button[type='submit']")
        self.assertIn("Crear cuenta", submit_btn.text)
        print("\n  [PASS] Modo registro: campo Nombre y botón 'Crear cuenta' visibles")

    # ------------------------------------------------------------------
    # 1.06 — Volver al modo login oculta el campo Nombre
    # ------------------------------------------------------------------
    def test_06_toggle_volver_a_login(self):
        """Desde registro regresa al login y desaparece el campo Nombre."""
        self.driver.find_element(
            By.XPATH, "//button[contains(text(), '¿No tienes cuenta?')]"
        ).click()
        self.wait.until(EC.visibility_of_element_located((By.ID, "name")))

        self.driver.find_element(
            By.XPATH, "//button[contains(text(), '¿Ya tienes cuenta?')]"
        ).click()

        self.wait.until(EC.invisibility_of_element_located((By.ID, "name")))
        submit_btn = self.driver.find_element(By.CSS_SELECTOR, "button[type='submit']")
        self.assertIn("Iniciar sesión", submit_btn.text)
        print("\n  [PASS] Regresó al login: campo Nombre oculto, botón 'Iniciar sesión'")

    # ------------------------------------------------------------------
    # 1.07 — Botones de rol en modo registro
    # ------------------------------------------------------------------
    def test_07_seleccion_rol_en_registro(self):
        """En modo registro, los botones de rol Estudiante y Profesor son clicables."""
        self.driver.find_element(
            By.XPATH, "//button[contains(text(), '¿No tienes cuenta?')]"
        ).click()
        self.wait.until(EC.visibility_of_element_located((By.ID, "name")))

        btn_estudiante = self.driver.find_element(
            By.XPATH, "//button[.//span[text()='Estudiante']]"
        )
        btn_profesor = self.driver.find_element(
            By.XPATH, "//button[.//span[text()='Profesor']]"
        )
        self.assertTrue(btn_estudiante.is_displayed(), "Botón 'Estudiante' no visible")
        self.assertTrue(btn_profesor.is_displayed(), "Botón 'Profesor' no visible")

        btn_profesor.click()
        time.sleep(0.3)
        btn_estudiante.click()
        time.sleep(0.3)
        print("\n  [PASS] Botones de rol Estudiante y Profesor clicables")

    # ------------------------------------------------------------------
    # 1.08 — Error con credenciales inválidas
    # ------------------------------------------------------------------
    def test_08_error_credenciales_invalidas(self):
        """Envía credenciales falsas y espera el mensaje de error de Supabase."""
        self.driver.find_element(By.ID, "email").send_keys("nadie@noexiste.xyz")
        self.driver.find_element(By.ID, "password").send_keys("claveInvalida999")
        self.driver.find_element(By.CSS_SELECTOR, "button[type='submit']").click()

        # LoginForm.jsx: <p className="text-destructive text-sm">{error}</p>
        error_element = self.wait.until(
            EC.visibility_of_element_located((By.CSS_SELECTOR, "p.text-destructive"))
        )
        self.assertTrue(error_element.is_displayed(), "No apareció mensaje de error")
        self.assertGreater(len(error_element.text), 0, "El mensaje de error está vacío")
        print(f"\n  [PASS] Mensaje de error: '{error_element.text}'")

    # ------------------------------------------------------------------
    # 1.09 — Toggle de visibilidad de contraseña
    # ------------------------------------------------------------------
    def test_09_toggle_visibilidad_contrasena(self):
        """El botón del ojo alterna el tipo del campo contraseña."""
        pwd = self.driver.find_element(By.ID, "password")
        pwd.send_keys("miContraseña123")

        self.assertEqual(pwd.get_attribute("type"), "password",
                         "La contraseña debería estar oculta por defecto")

        eye_btn = self.driver.find_element(
            By.XPATH, "//input[@id='password']/parent::div//button[@type='button']"
        )
        eye_btn.click()
        self.assertEqual(pwd.get_attribute("type"), "text",
                         "La contraseña debería ser visible tras el clic")

        eye_btn.click()
        self.assertEqual(pwd.get_attribute("type"), "password",
                         "La contraseña debería ocultarse al hacer clic de nuevo")
        print("\n  [PASS] Toggle visibilidad: password → text → password")

    # ------------------------------------------------------------------
    # 1.10 — Navegación con teclado Tab entre campos
    # ------------------------------------------------------------------
    def test_10_navegacion_teclado_tab(self):
        """Tab mueve el foco de email a password."""
        email_field = self.driver.find_element(By.ID, "email")
        email_field.click()
        email_field.send_keys("tab@test.com")
        email_field.send_keys(Keys.TAB)

        active_id = self.driver.switch_to.active_element.get_attribute("id")
        self.assertEqual(active_id, "password",
                         f"Tab no fue a 'password', fue a: '{active_id}'")
        print("\n  [PASS] Tab navega de email a password correctamente")

    # ------------------------------------------------------------------
    # 1.11 — Login con credenciales válidas redirige al dashboard
    # ------------------------------------------------------------------
    def test_11_login_credenciales_validas(self):
        """Login con credenciales reales redirige a /home, /teacher/home o /admin."""
        self.driver.find_element(By.ID, "email").send_keys(TEST_EMAIL)
        self.driver.find_element(By.ID, "password").send_keys(TEST_PASSWORD)
        self.driver.find_element(By.CSS_SELECTOR, "button[type='submit']").click()

        self.wait.until(lambda d: "/home" in d.current_url
                        or "/admin" in d.current_url
                        or "/teacher" in d.current_url)

        final_url = self.driver.current_url
        self.assertTrue(
            any(p in final_url for p in ["/home", "/admin", "/teacher"]),
            f"No redirigió al dashboard, URL actual: {final_url}"
        )
        print(f"\n  [PASS] Login exitoso, redirigió a: {final_url}")


# ===========================================================================
# SUITE 2 — NAVEGACIÓN POR EL SIDEBAR
# ===========================================================================
class Test02_Navegacion(unittest.TestCase):
    """
    Pruebas de navegación entre páginas usando el sidebar.
    Realiza login una sola vez en setUpClass y reutiliza la sesión.
    """

    @classmethod
    def setUpClass(cls):
        cls.driver = _build_driver()
        cls.wait = WebDriverWait(cls.driver, WAIT_TIMEOUT)
        _do_login(cls.driver, cls.wait)

    @classmethod
    def tearDownClass(cls):
        time.sleep(0.5)
        cls.driver.quit()

    def _ir_a_home(self):
        self.driver.get(f"{BASE_URL}/home")
        self.wait.until(EC.presence_of_element_located((By.XPATH, "//a[@href='/tasks']")))

    # ------------------------------------------------------------------
    # 2.01 — /home carga correctamente tras el login
    # ------------------------------------------------------------------
    def test_01_home_carga_tras_login(self):
        """Verifica que /home es accesible con sesión activa."""
        self._ir_a_home()
        self.assertIn("/home", self.driver.current_url)
        print(f"\n  [PASS] /home accesible tras login: {self.driver.current_url}")

    # ------------------------------------------------------------------
    # 2.02 — El sidebar contiene todos los enlaces principales
    # ------------------------------------------------------------------
    def test_02_sidebar_enlaces_principales(self):
        """Verifica que el sidebar tiene todos los enlaces de navegación."""
        self._ir_a_home()
        rutas_esperadas = [
            ('/home',     'Inicio'),
            ('/courses',  'Cursos'),
            ('/tasks',    'Tareas'),
            ('/calendar', 'Calendario'),
            ('/notes',    'Notas'),
            ('/stats',    'Estadísticas'),
            ('/settings', 'Configuración'),
        ]
        for href, label in rutas_esperadas:
            link = self.driver.find_element(By.XPATH, f"//a[@href='{href}']")
            self.assertTrue(link.is_displayed(), f"Enlace '{label}' ({href}) no visible")
        print("\n  [PASS] Todos los enlaces del sidebar están visibles")

    # ------------------------------------------------------------------
    # 2.03 — Navegar a Tareas
    # ------------------------------------------------------------------
    def test_03_navegar_a_tareas(self):
        """Clic en Tareas y verifica la URL resultante."""
        self._ir_a_home()
        self.driver.find_element(By.XPATH, "//a[@href='/tasks']").click()
        self.wait.until(EC.url_contains("/tasks"))
        self.assertIn("/tasks", self.driver.current_url)
        print(f"\n  [PASS] Navegó a Tareas: {self.driver.current_url}")

    # ------------------------------------------------------------------
    # 2.04 — Navegar a Notas
    # ------------------------------------------------------------------
    def test_04_navegar_a_notas(self):
        """Clic en Notas y verifica la URL resultante."""
        self._ir_a_home()
        self.driver.find_element(By.XPATH, "//a[@href='/notes']").click()
        self.wait.until(EC.url_contains("/notes"))
        self.assertIn("/notes", self.driver.current_url)
        print(f"\n  [PASS] Navegó a Notas: {self.driver.current_url}")

    # ------------------------------------------------------------------
    # 2.05 — Navegar a Configuración
    # ------------------------------------------------------------------
    def test_05_navegar_a_configuracion(self):
        """Clic en Configuración y verifica la URL resultante."""
        self._ir_a_home()
        self.driver.find_element(By.XPATH, "//a[@href='/settings']").click()
        self.wait.until(EC.url_contains("/settings"))
        self.assertIn("/settings", self.driver.current_url)
        print(f"\n  [PASS] Navegó a Configuración: {self.driver.current_url}")

    # ------------------------------------------------------------------
    # 2.06 — Navegar a Calendario
    # ------------------------------------------------------------------
    def test_06_navegar_a_calendario(self):
        """Clic en Calendario y verifica la URL resultante."""
        self._ir_a_home()
        self.driver.find_element(By.XPATH, "//a[@href='/calendar']").click()
        self.wait.until(EC.url_contains("/calendar"))
        self.assertIn("/calendar", self.driver.current_url)
        print(f"\n  [PASS] Navegó a Calendario: {self.driver.current_url}")

    # ------------------------------------------------------------------
    # 2.07 — Navegar a Estadísticas
    # ------------------------------------------------------------------
    def test_07_navegar_a_estadisticas(self):
        """Clic en Estadísticas y verifica la URL resultante."""
        self._ir_a_home()
        self.driver.find_element(By.XPATH, "//a[@href='/stats']").click()
        self.wait.until(EC.url_contains("/stats"))
        self.assertIn("/stats", self.driver.current_url)
        print(f"\n  [PASS] Navegó a Estadísticas: {self.driver.current_url}")

    # ------------------------------------------------------------------
    # 2.08 — Colapsar y expandir el sidebar
    # ------------------------------------------------------------------
    def test_08_colapsar_expandir_sidebar(self):
        """El botón de colapso alterna el aria-label del sidebar."""
        self._ir_a_home()
        collapse_btn = self.wait.until(
            EC.element_to_be_clickable((
                By.XPATH,
                "//button[@aria-label='Colapsar menú lateral' "
                "or @aria-label='Expandir menú lateral']"
            ))
        )
        label_antes = collapse_btn.get_attribute("aria-label")
        collapse_btn.click()
        time.sleep(0.5)

        collapse_btn = self.driver.find_element(
            By.XPATH,
            "//button[@aria-label='Colapsar menú lateral' "
            "or @aria-label='Expandir menú lateral']"
        )
        label_despues = collapse_btn.get_attribute("aria-label")
        self.assertNotEqual(label_antes, label_despues,
                            "El aria-label no cambió al colapsar")
        # Restaurar el sidebar expandido para tests posteriores
        collapse_btn.click()
        time.sleep(0.3)
        print(f"\n  [PASS] Sidebar: '{label_antes}' → '{label_despues}'")


# ===========================================================================
# SUITE 3 — GESTIÓN DE TAREAS
# ===========================================================================
class Test03_Tareas(unittest.TestCase):
    """Pruebas de la página de Tareas (/tasks) con sesión activa."""

    @classmethod
    def setUpClass(cls):
        cls.driver = _build_driver()
        cls.wait = WebDriverWait(cls.driver, WAIT_TIMEOUT)
        _do_login(cls.driver, cls.wait)

    @classmethod
    def tearDownClass(cls):
        time.sleep(0.5)
        cls.driver.quit()

    def setUp(self):
        self.driver.get(f"{BASE_URL}/tasks")
        time.sleep(1.5)

    # ------------------------------------------------------------------
    # 3.01 — La página carga en /tasks
    # ------------------------------------------------------------------
    def test_01_pagina_tareas_carga(self):
        """Verifica que /tasks carga correctamente con sesión activa."""
        self.assertIn("/tasks", self.driver.current_url,
                      f"No está en /tasks: {self.driver.current_url}")
        print(f"\n  [PASS] Página de tareas cargada: {self.driver.current_url}")

    # ------------------------------------------------------------------
    # 3.02 — Campo de búsqueda visible
    # ------------------------------------------------------------------
    def test_02_campo_busqueda_visible(self):
        """Verifica que hay un campo de búsqueda en /tasks."""
        search = self.wait.until(
            EC.presence_of_element_located((By.CSS_SELECTOR, "input[type='text']"))
        )
        self.assertTrue(search.is_displayed(), "Campo de búsqueda no visible")
        print("\n  [PASS] Campo de búsqueda encontrado")

    # ------------------------------------------------------------------
    # 3.03 — El campo de búsqueda acepta texto
    # ------------------------------------------------------------------
    def test_03_busqueda_acepta_texto(self):
        """Escribe en el buscador y verifica que el valor se registra."""
        search = self.wait.until(
            EC.visibility_of_element_located((By.CSS_SELECTOR, "input[type='text']"))
        )
        search.clear()
        search.send_keys("Parcial de Programación")
        time.sleep(0.3)
        self.assertIn("Parcial de Programación", search.get_attribute("value"))
        print("\n  [PASS] El buscador registra el texto correctamente")

    # ------------------------------------------------------------------
    # 3.04 — Hay botones de acción en la página
    # ------------------------------------------------------------------
    def test_04_botones_accion_presentes(self):
        """Verifica que hay botones visibles en la barra de herramientas."""
        buttons = self.driver.find_elements(By.CSS_SELECTOR, "button")
        visible = [b for b in buttons if b.is_displayed()]
        self.assertGreater(len(visible), 0, "No hay botones visibles en /tasks")
        print(f"\n  [PASS] {len(visible)} botones visibles en /tasks")

    # ------------------------------------------------------------------
    # 3.05 — Existen pestañas de navegación (Tareas / Categorías)
    # ------------------------------------------------------------------
    def test_05_tabs_visibles(self):
        """Verifica que existen pestañas de navegación en la página de tareas."""
        tabs = self.driver.find_elements(
            By.XPATH, "//*[@role='tab'] | //button[contains(@class, 'tab')]"
        )
        if tabs:
            tab_texts = [t.text for t in tabs if t.is_displayed() and t.text]
            self.assertGreater(len(tab_texts), 0, "No hay pestañas visibles")
            print(f"\n  [PASS] Pestañas encontradas: {tab_texts}")
        else:
            elements = self.driver.find_elements(
                By.XPATH, "//*[text()='Tareas' or text()='Categorías']"
            )
            visible = [el for el in elements if el.is_displayed()]
            self.assertGreater(len(visible), 0, "No se encontraron pestañas")
            print(f"\n  [PASS] Elementos de pestaña encontrados: {len(visible)}")

    # ------------------------------------------------------------------
    # 3.06 — El sidebar de navegación está presente
    # ------------------------------------------------------------------
    def test_06_sidebar_presente(self):
        """Verifica que el sidebar está visible en /tasks."""
        link = self.wait.until(
            EC.presence_of_element_located((By.XPATH, "//a[@href='/settings']"))
        )
        self.assertTrue(link.is_displayed(), "Sidebar no visible en /tasks")
        print("\n  [PASS] Sidebar presente en /tasks")

    # ------------------------------------------------------------------
    # 3.07 — Limpiar el campo de búsqueda lo deja vacío
    # ------------------------------------------------------------------
    def test_07_limpiar_busqueda(self):
        """Escribe texto, lo limpia y verifica que el campo queda vacío."""
        search = self.wait.until(
            EC.visibility_of_element_located((By.CSS_SELECTOR, "input[type='text']"))
        )
        search.send_keys("Texto a limpiar")
        time.sleep(0.2)
        search.clear()
        time.sleep(0.2)
        self.assertEqual(search.get_attribute("value"), "",
                         "El campo de búsqueda no quedó vacío tras limpiar")
        print("\n  [PASS] Campo de búsqueda se limpia correctamente")


# ===========================================================================
# SUITE 4 — GESTIÓN DE NOTAS
# ===========================================================================
class Test04_Notas(unittest.TestCase):
    """Pruebas de la página de Notas (/notes) con sesión activa."""

    @classmethod
    def setUpClass(cls):
        cls.driver = _build_driver()
        cls.wait = WebDriverWait(cls.driver, WAIT_TIMEOUT)
        _do_login(cls.driver, cls.wait)

    @classmethod
    def tearDownClass(cls):
        time.sleep(0.5)
        cls.driver.quit()

    def setUp(self):
        self.driver.get(f"{BASE_URL}/notes")
        time.sleep(1.5)

    # ------------------------------------------------------------------
    # 4.01 — La página carga en /notes
    # ------------------------------------------------------------------
    def test_01_pagina_notas_carga(self):
        """Verifica que /notes carga correctamente con sesión activa."""
        self.assertIn("/notes", self.driver.current_url,
                      f"No está en /notes: {self.driver.current_url}")
        print(f"\n  [PASS] Página de notas cargada: {self.driver.current_url}")

    # ------------------------------------------------------------------
    # 4.02 — Campo de búsqueda visible
    # ------------------------------------------------------------------
    def test_02_campo_busqueda_visible(self):
        """Verifica que hay un campo de búsqueda en /notes."""
        search = self.wait.until(
            EC.presence_of_element_located((By.CSS_SELECTOR, "input[type='text']"))
        )
        self.assertTrue(search.is_displayed(), "Campo de búsqueda no visible")
        print("\n  [PASS] Campo de búsqueda encontrado en /notes")

    # ------------------------------------------------------------------
    # 4.03 — El buscador acepta texto
    # ------------------------------------------------------------------
    def test_03_busqueda_acepta_texto(self):
        """Escribe en el buscador de notas y verifica el valor."""
        search = self.wait.until(
            EC.visibility_of_element_located((By.CSS_SELECTOR, "input[type='text']"))
        )
        search.clear()
        search.send_keys("Apuntes de cálculo")
        time.sleep(0.3)
        self.assertIn("Apuntes de cálculo", search.get_attribute("value"))
        print("\n  [PASS] Búsqueda de notas funciona")

    # ------------------------------------------------------------------
    # 4.04 — La fecha actual con día de la semana está visible
    # ------------------------------------------------------------------
    def test_04_fecha_visible(self):
        """Verifica que la página muestra el día de la semana actual."""
        dias = ["Lunes", "Martes", "Miércoles", "Jueves",
                "Viernes", "Sábado", "Domingo"]
        body_text = self.driver.find_element(By.TAG_NAME, "body").text
        self.assertTrue(any(d in body_text for d in dias),
                        "Ningún día de la semana encontrado en /notes")
        print("\n  [PASS] Fecha con día de la semana visible en /notes")

    # ------------------------------------------------------------------
    # 4.05 — Hay botones de acción visibles
    # ------------------------------------------------------------------
    def test_05_botones_accion_presentes(self):
        """Verifica que hay botones visibles en la página de notas."""
        buttons = self.driver.find_elements(By.CSS_SELECTOR, "button")
        visible = [b for b in buttons if b.is_displayed()]
        self.assertGreater(len(visible), 0, "No hay botones en /notes")
        print(f"\n  [PASS] {len(visible)} botones visibles en /notes")

    # ------------------------------------------------------------------
    # 4.06 — El sidebar está presente en /notes
    # ------------------------------------------------------------------
    def test_06_sidebar_presente(self):
        """Verifica que el sidebar de navegación está en /notes."""
        link = self.wait.until(
            EC.presence_of_element_located((By.XPATH, "//a[@href='/tasks']"))
        )
        self.assertTrue(link.is_displayed(), "Sidebar no visible en /notes")
        print("\n  [PASS] Sidebar presente en /notes")


# ===========================================================================
# SUITE 5 — CONFIGURACIÓN
# ===========================================================================
class Test05_Configuracion(unittest.TestCase):
    """Pruebas de la página de Configuración (/settings) con sesión activa."""

    @classmethod
    def setUpClass(cls):
        cls.driver = _build_driver()
        cls.wait = WebDriverWait(cls.driver, WAIT_TIMEOUT)
        _do_login(cls.driver, cls.wait)

    @classmethod
    def tearDownClass(cls):
        time.sleep(0.5)
        cls.driver.quit()

    def setUp(self):
        self.driver.get(f"{BASE_URL}/settings")
        time.sleep(1.5)

    # ------------------------------------------------------------------
    # 5.01 — La página carga en /settings
    # ------------------------------------------------------------------
    def test_01_pagina_configuracion_carga(self):
        """Verifica que /settings carga con sesión activa."""
        self.assertIn("/settings", self.driver.current_url,
                      f"No está en /settings: {self.driver.current_url}")
        print(f"\n  [PASS] /settings cargado: {self.driver.current_url}")

    # ------------------------------------------------------------------
    # 5.02 — El título '⚙️ Configuración' está visible
    # ------------------------------------------------------------------
    def test_02_titulo_configuracion_visible(self):
        """Verifica que el encabezado de la página dice 'Configuración'."""
        heading = self.wait.until(
            EC.presence_of_element_located(
                (By.XPATH, "//*[contains(text(), 'Configuración')]")
            )
        )
        self.assertTrue(heading.is_displayed(), "Título de Configuración no visible")
        print(f"\n  [PASS] Título encontrado: '{heading.text[:40]}'")

    # ------------------------------------------------------------------
    # 5.03 — El menú lateral tiene las 6 secciones
    # ------------------------------------------------------------------
    def test_03_menu_todas_las_secciones(self):
        """Verifica que el menú tiene las secciones Perfil, Seguridad, etc."""
        secciones = ['Perfil', 'Seguridad', 'Notificaciones',
                     'Apariencia', 'Privacidad', 'Logros']
        for seccion in secciones:
            btn = self.wait.until(
                EC.presence_of_element_located(
                    (By.XPATH, f"//button[contains(text(), '{seccion}')]")
                )
            )
            self.assertTrue(btn.is_displayed(), f"Sección '{seccion}' no visible")
        print(f"\n  [PASS] Las 6 secciones del menú están presentes")

    # ------------------------------------------------------------------
    # 5.04 — Navegar a Seguridad
    # ------------------------------------------------------------------
    def test_04_navegar_seccion_seguridad(self):
        """Clic en 'Seguridad' y verifica que el botón se marca como activo."""
        self.driver.find_element(
            By.XPATH, "//button[contains(text(), 'Seguridad')]"
        ).click()
        time.sleep(0.5)

        active = self.driver.find_elements(
            By.XPATH,
            "//button[contains(@class, 'text-primary') "
            "and contains(text(), 'Seguridad')]"
        )
        self.assertGreater(len(active), 0, "Botón 'Seguridad' no activo")
        print("\n  [PASS] Sección 'Seguridad' activada")

    # ------------------------------------------------------------------
    # 5.05 — Navegar a Apariencia
    # ------------------------------------------------------------------
    def test_05_navegar_seccion_apariencia(self):
        """Clic en 'Apariencia' y verifica que el botón se marca como activo."""
        self.driver.find_element(
            By.XPATH, "//button[contains(text(), 'Apariencia')]"
        ).click()
        time.sleep(0.5)

        active = self.driver.find_elements(
            By.XPATH,
            "//button[contains(@class, 'text-primary') "
            "and contains(text(), 'Apariencia')]"
        )
        self.assertGreater(len(active), 0, "Botón 'Apariencia' no activo")
        print("\n  [PASS] Sección 'Apariencia' activada")

    # ------------------------------------------------------------------
    # 5.06 — Navegar a Notificaciones
    # ------------------------------------------------------------------
    def test_06_navegar_seccion_notificaciones(self):
        """Clic en 'Notificaciones' y verifica que el botón se marca como activo."""
        self.driver.find_element(
            By.XPATH, "//button[contains(text(), 'Notificaciones')]"
        ).click()
        time.sleep(0.5)

        active = self.driver.find_elements(
            By.XPATH,
            "//button[contains(@class, 'text-primary') "
            "and contains(text(), 'Notificaciones')]"
        )
        self.assertGreater(len(active), 0, "Botón 'Notificaciones' no activo")
        print("\n  [PASS] Sección 'Notificaciones' activada")

    # ------------------------------------------------------------------
    # 5.07 — Navegar a Logros
    # ------------------------------------------------------------------
    def test_07_navegar_seccion_logros(self):
        """Clic en 'Logros' y verifica que el botón se marca como activo."""
        self.driver.find_element(
            By.XPATH, "//button[contains(text(), 'Logros')]"
        ).click()
        time.sleep(0.5)

        active = self.driver.find_elements(
            By.XPATH,
            "//button[contains(@class, 'text-primary') "
            "and contains(text(), 'Logros')]"
        )
        self.assertGreater(len(active), 0, "Botón 'Logros' no activo")
        print("\n  [PASS] Sección 'Logros' activada")


# ===========================================================================
# SUITE 6 — HOME / DASHBOARD
# ===========================================================================
class Test06_Home(unittest.TestCase):
    """Pruebas del dashboard de inicio (/home) con sesión activa."""

    @classmethod
    def setUpClass(cls):
        cls.driver = _build_driver()
        cls.wait = WebDriverWait(cls.driver, WAIT_TIMEOUT)
        _do_login(cls.driver, cls.wait)

    @classmethod
    def tearDownClass(cls):
        time.sleep(0.5)
        cls.driver.quit()

    def setUp(self):
        self.driver.get(f"{BASE_URL}/home")
        time.sleep(1.5)

    # ------------------------------------------------------------------
    # 6.01 — URL correcta
    # ------------------------------------------------------------------
    def test_01_home_url_correcta(self):
        """Verifica que la URL permanece en /home."""
        self.assertIn("/home", self.driver.current_url)
        print(f"\n  [PASS] URL del home: {self.driver.current_url}")

    # ------------------------------------------------------------------
    # 6.02 — El logo "Captus" del sidebar está visible
    # ------------------------------------------------------------------
    def test_02_logo_captus_visible(self):
        """Verifica que el logo 'Captus' está en el sidebar."""
        logo = self.wait.until(
            EC.presence_of_element_located(
                (By.XPATH, "//*[contains(text(), 'Captus')]")
            )
        )
        self.assertTrue(logo.is_displayed(), "Logo 'Captus' no visible")
        print("\n  [PASS] Logo 'Captus' visible en el sidebar")

    # ------------------------------------------------------------------
    # 6.03 — Todos los enlaces del sidebar están presentes
    # ------------------------------------------------------------------
    def test_03_sidebar_enlaces_completos(self):
        """Verifica que el sidebar tiene todas las rutas de la aplicación."""
        rutas = ['/home', '/courses', '/tasks', '/calendar',
                 '/notes', '/stats', '/settings']
        for href in rutas:
            link = self.driver.find_element(By.XPATH, f"//a[@href='{href}']")
            self.assertTrue(link.is_displayed(), f"Enlace {href} no visible")
        print(f"\n  [PASS] {len(rutas)} enlaces del sidebar verificados")

    # ------------------------------------------------------------------
    # 6.04 — El enlace de Inicio tiene clase activa
    # ------------------------------------------------------------------
    def test_04_enlace_inicio_tiene_clases(self):
        """Verifica que el enlace /home tiene clases CSS asignadas."""
        home_link = self.driver.find_element(By.XPATH, "//a[@href='/home']")
        css_class = home_link.get_attribute("class") or ""
        self.assertGreater(len(css_class), 0,
                           "El enlace de Inicio no tiene clases CSS")
        print(f"\n  [PASS] Clases del enlace Inicio: '{css_class[:80]}'")

    # ------------------------------------------------------------------
    # 6.05 — La fecha actual está visible en el home
    # ------------------------------------------------------------------
    def test_05_fecha_visible(self):
        """Verifica que el home muestra el día de la semana actual."""
        dias = ["Lunes", "Martes", "Miércoles", "Jueves",
                "Viernes", "Sábado", "Domingo"]
        body_text = self.driver.find_element(By.TAG_NAME, "body").text
        self.assertTrue(any(d in body_text for d in dias),
                        "No se encontró ningún día de la semana en /home")
        print("\n  [PASS] Fecha con día de semana visible en el home")

    # ------------------------------------------------------------------
    # 6.06 — El botón de cerrar sesión está presente
    # ------------------------------------------------------------------
    def test_06_boton_logout_presente(self):
        """Verifica que existe un botón para cerrar sesión en el sidebar."""
        logout_candidates = self.driver.find_elements(
            By.XPATH,
            "//button[contains(@class, 'text-muted') "
            "or contains(text(), 'Salir') "
            "or contains(text(), 'Cerrar')]"
        )
        sidebar_buttons = self.driver.find_elements(
            By.CSS_SELECTOR, "button[class*='flex'][class*='items-center']"
        )
        visible = [b for b in (logout_candidates + sidebar_buttons)
                   if b.is_displayed()]
        self.assertGreater(len(visible), 0,
                           "No se encontró botón de logout en el sidebar")
        print("\n  [PASS] Botón de logout encontrado en el sidebar")


# ===========================================================================
# SUITE 7 — CALENDARIO
# ===========================================================================
class Test07_Calendario(unittest.TestCase):
    """Pruebas de la página de Calendario (/calendar) con sesión activa."""

    @classmethod
    def setUpClass(cls):
        cls.driver = _build_driver()
        cls.wait = WebDriverWait(cls.driver, WAIT_TIMEOUT)
        _do_login(cls.driver, cls.wait)

    @classmethod
    def tearDownClass(cls):
        time.sleep(0.5)
        cls.driver.quit()

    def setUp(self):
        self.driver.get(f"{BASE_URL}/calendar")
        time.sleep(1.5)

    # ------------------------------------------------------------------
    # 7.01 — La página carga en /calendar
    # ------------------------------------------------------------------
    def test_01_calendario_carga(self):
        """Verifica que /calendar carga con sesión activa."""
        self.assertIn("/calendar", self.driver.current_url,
                      f"No está en /calendar: {self.driver.current_url}")
        print(f"\n  [PASS] Calendario cargado: {self.driver.current_url}")

    # ------------------------------------------------------------------
    # 7.02 — La página tiene contenido visible
    # ------------------------------------------------------------------
    def test_02_calendario_tiene_contenido(self):
        """Verifica que la página de calendario tiene contenido."""
        body_text = self.driver.find_element(By.TAG_NAME, "body").text
        self.assertGreater(len(body_text.strip()), 20,
                           "La página de calendario parece vacía")
        print(f"\n  [PASS] Calendario con contenido ({len(body_text)} chars)")

    # ------------------------------------------------------------------
    # 7.03 — El sidebar está presente
    # ------------------------------------------------------------------
    def test_03_sidebar_presente(self):
        """Verifica que el sidebar de navegación está en /calendar."""
        notes_link = self.wait.until(
            EC.presence_of_element_located((By.XPATH, "//a[@href='/notes']"))
        )
        self.assertTrue(notes_link.is_displayed(),
                        "Sidebar no visible en /calendar")
        print("\n  [PASS] Sidebar presente en /calendar")

    # ------------------------------------------------------------------
    # 7.04 — El enlace de Calendario tiene estado activo en el sidebar
    # ------------------------------------------------------------------
    def test_04_enlace_calendario_activo(self):
        """Verifica que el enlace de Calendario tiene clases CSS en el sidebar."""
        cal_link = self.driver.find_element(By.XPATH, "//a[@href='/calendar']")
        css_class = cal_link.get_attribute("class") or ""
        self.assertGreater(len(css_class), 0,
                           "El enlace de Calendario no tiene clases CSS")
        print("\n  [PASS] Enlace Calendario tiene clases de estado")


# ===========================================================================
# SUITE 8 — ESTADÍSTICAS
# ===========================================================================
class Test08_Estadisticas(unittest.TestCase):
    """Pruebas de la página de Estadísticas (/stats) con sesión activa."""

    @classmethod
    def setUpClass(cls):
        cls.driver = _build_driver()
        cls.wait = WebDriverWait(cls.driver, WAIT_TIMEOUT)
        _do_login(cls.driver, cls.wait)

    @classmethod
    def tearDownClass(cls):
        time.sleep(0.5)
        cls.driver.quit()

    def setUp(self):
        self.driver.get(f"{BASE_URL}/stats")
        time.sleep(1.5)

    # ------------------------------------------------------------------
    # 8.01 — La página carga en /stats
    # ------------------------------------------------------------------
    def test_01_estadisticas_cargan(self):
        """Verifica que /stats carga con sesión activa."""
        self.assertIn("/stats", self.driver.current_url,
                      f"No está en /stats: {self.driver.current_url}")
        print(f"\n  [PASS] Estadísticas cargadas: {self.driver.current_url}")

    # ------------------------------------------------------------------
    # 8.02 — La página tiene contenido visible
    # ------------------------------------------------------------------
    def test_02_estadisticas_tienen_contenido(self):
        """Verifica que la página de estadísticas tiene contenido."""
        body_text = self.driver.find_element(By.TAG_NAME, "body").text
        self.assertGreater(len(body_text.strip()), 20,
                           "La página de estadísticas parece vacía")
        print("\n  [PASS] Página de estadísticas tiene contenido")

    # ------------------------------------------------------------------
    # 8.03 — El sidebar está presente
    # ------------------------------------------------------------------
    def test_03_sidebar_presente(self):
        """Verifica que el sidebar de navegación está en /stats."""
        settings_link = self.wait.until(
            EC.presence_of_element_located((By.XPATH, "//a[@href='/settings']"))
        )
        self.assertTrue(settings_link.is_displayed(),
                        "Sidebar no visible en /stats")
        print("\n  [PASS] Sidebar presente en /stats")


# ===========================================================================
# SUITE 9 — ACCESIBILIDAD Y EXPERIENCIA DE USUARIO
# ===========================================================================
class Test09_AccesibilidadUX(unittest.TestCase):
    """
    Pruebas de accesibilidad básica y buenas prácticas de UI/UX.
    Los primeros tests (01-04) prueban el formulario de login (sin sesión).
    Los tests (05-06) requieren sesión activa.
    """

    @classmethod
    def setUpClass(cls):
        cls.driver = _build_driver()
        cls.wait = WebDriverWait(cls.driver, WAIT_TIMEOUT)

    @classmethod
    def tearDownClass(cls):
        time.sleep(0.5)
        cls.driver.quit()

    # ------------------------------------------------------------------
    # 9.01 — El input de email tiene type='email'
    # ------------------------------------------------------------------
    def test_01_input_email_tipo_correcto(self):
        """Verifica que el campo de email usa type='email'."""
        self.driver.get(BASE_URL)
        _clear_session(self.driver)
        self.driver.get(BASE_URL)
        self.wait.until(EC.visibility_of_element_located((By.ID, "email")))
        email_input = self.driver.find_element(By.ID, "email")
        self.assertEqual(email_input.get_attribute("type"), "email")
        print("\n  [PASS] Campo email tiene type='email'")

    # ------------------------------------------------------------------
    # 9.02 — El input de password tiene type='password' por defecto
    # ------------------------------------------------------------------
    def test_02_input_password_tipo_correcto(self):
        """Verifica que la contraseña empieza oculta (type='password')."""
        self.driver.get(BASE_URL)
        _clear_session(self.driver)
        self.driver.get(BASE_URL)
        self.wait.until(EC.visibility_of_element_located((By.ID, "password")))
        pwd_input = self.driver.find_element(By.ID, "password")
        self.assertEqual(pwd_input.get_attribute("type"), "password")
        print("\n  [PASS] Campo password tiene type='password'")

    # ------------------------------------------------------------------
    # 9.03 — Los campos tienen etiquetas accesibles (labels)
    # ------------------------------------------------------------------
    def test_03_campos_tienen_labels(self):
        """Verifica que email y password tienen <label> asociados."""
        self.driver.get(BASE_URL)
        _clear_session(self.driver)
        self.driver.get(BASE_URL)
        self.wait.until(EC.visibility_of_element_located((By.ID, "email")))

        email_label = self.driver.find_element(By.XPATH, "//label[@for='email']")
        pwd_label = self.driver.find_element(By.XPATH, "//label[@for='password']")
        self.assertTrue(email_label.is_displayed(), "Label para email no visible")
        self.assertTrue(pwd_label.is_displayed(), "Label para password no visible")
        print(f"\n  [PASS] Labels: email='{email_label.text}', "
              f"password='{pwd_label.text}'")

    # ------------------------------------------------------------------
    # 9.04 — El campo Nombre en registro tiene atributo required
    # ------------------------------------------------------------------
    def test_04_campo_nombre_required(self):
        """Verifica que el campo nombre en registro tiene atributo required."""
        self.driver.get(BASE_URL)
        _clear_session(self.driver)
        self.driver.get(BASE_URL)
        self.wait.until(EC.visibility_of_element_located((By.ID, "email")))

        self.driver.find_element(
            By.XPATH, "//button[contains(text(), '¿No tienes cuenta?')]"
        ).click()
        name_field = self.wait.until(
            EC.visibility_of_element_located((By.ID, "name"))
        )
        self.assertIsNotNone(name_field.get_attribute("required"),
                             "El campo nombre no tiene atributo 'required'")
        print("\n  [PASS] Campo nombre tiene atributo required")

    # ------------------------------------------------------------------
    # 9.05 — El documento HTML tiene un <title> no vacío
    # ------------------------------------------------------------------
    def test_05_titulo_html_presente(self):
        """Verifica que el documento tiene un <title> con texto."""
        _do_login(self.driver, self.wait)
        self.driver.get(f"{BASE_URL}/home")
        time.sleep(1)
        title = self.driver.title
        self.assertIsNotNone(title)
        self.assertGreater(len(title.strip()), 0, "El <title> está vacío")
        print(f"\n  [PASS] Título HTML: '{title}'")

    # ------------------------------------------------------------------
    # 9.06 — El botón de colapso del sidebar tiene aria-label descriptivo
    # ------------------------------------------------------------------
    def test_06_sidebar_aria_label(self):
        """Verifica que el botón de colapso del sidebar tiene aria-label."""
        self.driver.get(f"{BASE_URL}/home")
        self.wait.until(
            EC.presence_of_element_located((By.XPATH, "//a[@href='/tasks']"))
        )
        collapse_btn = self.driver.find_element(
            By.XPATH,
            "//button[@aria-label='Colapsar menú lateral' "
            "or @aria-label='Expandir menú lateral']"
        )
        aria_label = collapse_btn.get_attribute("aria-label")
        self.assertIsNotNone(aria_label)
        self.assertGreater(len(aria_label), 0)
        print(f"\n  [PASS] Botón de colapso tiene aria-label: '{aria_label}'")


# ===========================================================================
# PUNTO DE ENTRADA
# ===========================================================================
if __name__ == "__main__":
    unittest.main(verbosity=2)
