"""
Tests de Selenium para Captus Web
===================================
Requiere: pip install selenium
La app debe estar corriendo en: http://localhost:5173  (npm run dev)
"""

import unittest
import time
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.options import Options

BASE_URL = "http://localhost:5173"


class CaptusLoginTests(unittest.TestCase):
    """
    Suite de pruebas para la pantalla de Login / Registro de Captus.
    Cada método test_XX es un caso de prueba independiente.
    """

    @classmethod
    def setUpClass(cls):
        """Se ejecuta UNA VEZ antes de todos los tests. Abre el navegador."""
        options = Options()
        # Descomenta la siguiente línea para correr en modo silencioso (sin ventana)
        # options.add_argument("--headless")
        options.add_argument("--window-size=1280,800")

        cls.driver = webdriver.Chrome(options=options)
        cls.driver.implicitly_wait(5)
        cls.wait = WebDriverWait(cls.driver, 10)

    @classmethod
    def tearDownClass(cls):
        """Se ejecuta UNA VEZ al final. Cierra el navegador."""
        time.sleep(1)
        cls.driver.quit()

    def setUp(self):
        """Se ejecuta antes de CADA test. Navega al inicio."""
        self.driver.get(BASE_URL)
        time.sleep(0.5)

    # ------------------------------------------------------------------
    # TEST 1 — La página carga y muestra el formulario
    # ------------------------------------------------------------------
    def test_01_pagina_login_carga_correctamente(self):
        """Verifica que la página abre y muestra los campos de email y contraseña."""
        email_field    = self.driver.find_element(By.ID, "email")
        password_field = self.driver.find_element(By.ID, "password")

        self.assertTrue(email_field.is_displayed(),    "El campo email no está visible")
        self.assertTrue(password_field.is_displayed(), "El campo password no está visible")
        print("\n  [PASS] Campos email y password encontrados y visibles")

    # ------------------------------------------------------------------
    # TEST 2 — Los campos del formulario aceptan texto
    # ------------------------------------------------------------------
    def test_02_campos_aceptan_texto(self):
        """Escribe en email y password y comprueba que el valor fue ingresado."""
        email_field    = self.driver.find_element(By.ID, "email")
        password_field = self.driver.find_element(By.ID, "password")

        email_field.send_keys("estudiante@captus.com")
        password_field.send_keys("MiClaveSegura123")

        self.assertEqual(
            email_field.get_attribute("value"),
            "estudiante@captus.com",
            "El campo email no registró el texto correctamente"
        )
        self.assertEqual(
            password_field.get_attribute("value"),
            "MiClaveSegura123",
            "El campo password no registró el texto correctamente"
        )
        print("\n  [PASS] Los campos de texto aceptan y conservan los valores")

    # ------------------------------------------------------------------
    # TEST 3 — El botón de "Iniciar sesión" existe y está habilitado
    # ------------------------------------------------------------------
    def test_03_boton_submit_visible_y_habilitado(self):
        """Verifica que el botón de submit esté presente y se pueda pulsar."""
        submit_btn = self.driver.find_element(By.CSS_SELECTOR, "button[type='submit']")

        self.assertTrue(submit_btn.is_displayed(), "El botón de submit no está visible")
        self.assertTrue(submit_btn.is_enabled(),   "El botón de submit está deshabilitado")
        print(f"\n  [PASS] Botón encontrado: '{submit_btn.text}'")

    # ------------------------------------------------------------------
    # TEST 4 — El enlace a "Registro" cambia el formulario
    # ------------------------------------------------------------------
    def test_04_toggle_modo_registro(self):
        """Hace click en '¿No tienes cuenta?' y verifica que aparece el campo Nombre."""
        toggle_link = self.driver.find_element(
            By.XPATH, "//button[contains(text(), '¿No tienes cuenta?')]"
        )
        toggle_link.click()

        # El campo 'name' solo aparece en el modo registro
        name_field = self.wait.until(
            EC.visibility_of_element_located((By.ID, "name"))
        )
        self.assertTrue(name_field.is_displayed(), "El campo Nombre no apareció en modo registro")

        # El texto del botón de submit debe haber cambiado
        submit_btn = self.driver.find_element(By.CSS_SELECTOR, "button[type='submit']")
        self.assertIn("Crear cuenta", submit_btn.text)
        print("\n  [PASS] Modo registro activo: campo Nombre y botón 'Crear cuenta' visibles")

    # ------------------------------------------------------------------
    # TEST 5 — Credenciales incorrectas muestran un mensaje de error
    # ------------------------------------------------------------------
    def test_05_error_con_credenciales_invalidas(self):
        """Envía el formulario con datos falsos y espera que aparezca un mensaje de error."""
        self.driver.find_element(By.ID, "email").send_keys("nadie@noexiste.xyz")
        self.driver.find_element(By.ID, "password").send_keys("claveInvalida999")
        self.driver.find_element(By.CSS_SELECTOR, "button[type='submit']").click()

        # Esperar el div de error (tiene clase text-red-600 según LoginForm.jsx)
        error_element = self.wait.until(
            EC.visibility_of_element_located((By.CSS_SELECTOR, ".text-red-600"))
        )
        self.assertTrue(error_element.is_displayed(), "No apareció ningún mensaje de error")
        print(f"\n  [PASS] Mensaje de error mostrado: '{error_element.text}'")

    # ------------------------------------------------------------------
    # TEST 6 — El botón del ojo alterna la visibilidad de la contraseña
    # ------------------------------------------------------------------
    def test_06_toggle_visibilidad_contrasena(self):
        """Verifica que la contraseña empieza oculta y se vuelve visible al presionar el ojo."""
        password_field = self.driver.find_element(By.ID, "password")
        password_field.send_keys("miContraseña")

        # Por defecto el tipo debe ser 'password' (texto oculto)
        self.assertEqual(
            password_field.get_attribute("type"), "password",
            "La contraseña debería estar oculta por defecto"
        )

        # El botón del ojo está dentro del div relativo al campo password
        eye_button = self.driver.find_element(
            By.XPATH, "//input[@id='password']/parent::div//button[@type='button']"
        )
        eye_button.click()

        # Ahora el tipo debe ser 'text' (texto visible)
        self.assertEqual(
            password_field.get_attribute("type"), "text",
            "La contraseña debería ser visible tras hacer click en el ojo"
        )
        print("\n  [PASS] Toggle de visibilidad funciona: password → text")


if __name__ == "__main__":
    unittest.main(verbosity=2)
