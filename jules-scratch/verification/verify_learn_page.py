from playwright.sync_api import sync_playwright, expect

def run_verification():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        try:
            # 1. Go directly to the learn-top page.
            page.goto("http://localhost:9002/learn-top")

            # 2. Wait for the new page to load by looking for a key element.
            header_title = page.get_by_role("heading", name="学習を始めよう")
            expect(header_title).to_be_visible(timeout=15000)

            # 3. Take a screenshot of the new dashboard
            page.screenshot(path="jules-scratch/verification/learn-top-page-layout-fixed.png", full_page=True)

            print("Successfully created screenshot of the fixed learn-top page layout.")

        except Exception as e:
            print(f"An error occurred during verification: {e}")
            page.screenshot(path="jules-scratch/verification/error-layout-fixed.png")
        finally:
            browser.close()

if __name__ == "__main__":
    run_verification()
