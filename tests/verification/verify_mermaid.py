from playwright.sync_api import Page, expect, sync_playwright
import os

def verify_mermaid(page: Page):
    # Navigate to the test page
    page.goto("http://localhost:5173/test-diagram")

    # Wait for the editor to open (it is open by default)
    expect(page.get_by_text("Nuevo Diagrama")).to_be_visible()

    # The editor has a "Vista Previa" section.
    # We expect an SVG to be rendered inside the "mermaid-container"

    # Wait for mermaid to render
    # We can check for a node inside the container.
    # The default code is `graph TD ...`
    # Mermaid renders nodes with class "node" or similar.

    # Wait for the SVG to be present
    page.wait_for_selector(".mermaid-container svg", timeout=10000)

    # Take a screenshot
    os.makedirs("/home/jules/verification", exist_ok=True)
    page.screenshot(path="/home/jules/verification/mermaid_verification.png")

if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        try:
            verify_mermaid(page)
            print("Verification successful")
        except Exception as e:
            print(f"Verification failed: {e}")
            page.screenshot(path="/home/jules/verification/error.png")
            raise
        finally:
            browser.close()
