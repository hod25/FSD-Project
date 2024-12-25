import subprocess
import sys

def install_packages():
    try:
        # Install required libraries from requirements.txt
        subprocess.check_call([sys.executable, "-m", "pip", "install", "-r", "requirements.txt"])
        print("All packages installed successfully.")
    except subprocess.CalledProcessError as e:
        print(f"Error during installation: {e}")

if __name__ == "__main__":
    install_packages()
