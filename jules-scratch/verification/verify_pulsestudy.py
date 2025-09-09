import time
from playwright.sync_api import sync_playwright, expect

def run_verification(playwright):
    timestamp = int(time.time())
    email = f"student_{timestamp}@test.com"
    password = "password123"

    browser = playwright.chromium.launch(headless=True)
    context = browser.new_context(
        permissions=["camera"],
        viewport={"width": 1280, "height": 720}
    )
    page = context.new_page()

    def click_safely(locator):
        """Wrapper to wait for a locator to be visible and enabled before clicking."""
        print(f"Attempting to click locator: {locator}")
        expect(locator).to_be_visible(timeout=15000)
        expect(locator).to_be_enabled(timeout=15000)
        locator.click()
        print(f"Successfully clicked locator: {locator}")

    def fill_safely(label, value):
        """Wrapper to fill inputs."""
        print(f"Attempting to fill input: '{label}'")
        input_locator = page.get_by_label(label)
        expect(input_locator).to_be_visible(timeout=15000)
        input_locator.fill(value)
        print(f"Successfully filled input: '{label}'")

    try:
        print("Navigating to the root page...")
        page.goto("http://localhost:3000/", timeout=30000)

        click_safely(page.get_by_role("button", name="生徒はこちら"))

        print("Navigating through welcome slides...")
        click_safely(page.get_by_role("button", name="次へ"))
        click_safely(page.get_by_role("button", name="次へ"))

        print("Agreeing to privacy policy...")
        # Using a more direct locator as a last resort
        agree_button = page.locator('button:has-text("同意して始める")')
        click_safely(agree_button)

        print(f"Creating student account with email: {email}")
        fill_safely("メールアドレス", email)
        fill_safely("パスワード", password)
        click_safely(page.get_by_role("button", name="無料で学習を始める"))

        print("Waiting for login and navigation to home page...")
        expect(page).to_have_url("http://localhost:3000/home", timeout=20000)
        print("Successfully logged in.")

        print("Navigating to /dev/benchmark...")
        page.goto("http://localhost:3000/dev/benchmark", timeout=30000)

        print("Verifying benchmark page functionality...")
        pulse_score_label = page.get_by_text("Pulse Score", exact=True)
        expect(pulse_score_label).to_be_visible(timeout=20000)
        print("Pulse score label is visible.")

        video_element = page.locator("video")
        expect(video_element).to_be_visible()
        print("Video element is visible.")

        page.wait_for_timeout(3000)

        screenshot_path = "jules-scratch/verification/benchmark_verification.png"
        print(f"Taking screenshot... saving to {screenshot_path}")
        page.screenshot(path=screenshot_path)
        print("Screenshot taken successfully.")

    except Exception as e:
        print(f"An error occurred: {e}")
        page.screenshot(path="jules-scratch/verification/error.png")
    finally:
        context.close()
        browser.close()

if __name__ == "__main__":
    with sync_playwright() as p:
        run_verification(p)
