import requests
import sys
import time
from datetime import datetime

class FitnessAppTester:
    def __init__(self, base_url="http://localhost:8001"):
        self.base_url = base_url
        self.token = None
        self.trainer_id = None
        self.tests_run = 0
        self.tests_passed = 0
        self.test_results = []

    def run_test(self, name, method, endpoint, expected_status, data=None):
        """Run a single API test"""
        url = f"{self.base_url}{endpoint}"
        headers = {'Content-Type': 'application/json'}
        if self.token:
            headers['Authorization'] = f'Bearer {self.token}'

        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=headers)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=headers)

            success = response.status_code == expected_status
            
            # Print response details
            print(f"Status Code: {response.status_code}")
            try:
                response_data = response.json()
                print(f"Response: {response_data}")
            except:
                print(f"Response: {response.text}")
            
            if success:
                self.tests_passed += 1
                print(f"✅ Passed - Status: {response.status_code}")
                self.test_results.append({"name": name, "status": "PASSED", "details": response_data if 'response_data' in locals() else response.text})
                return success, response.json() if 'response_data' in locals() else {}
            else:
                print(f"❌ Failed - Expected {expected_status}, got {response.status_code}")
                self.test_results.append({"name": name, "status": "FAILED", "details": f"Expected {expected_status}, got {response.status_code}"})
                return success, {}

        except Exception as e:
            print(f"❌ Failed - Error: {str(e)}")
            self.test_results.append({"name": name, "status": "ERROR", "details": str(e)})
            return False, {}

    def test_health_check(self):
        """Test the health check endpoint"""
        print("\n=== Testing Health Check Endpoint ===")
        success, response = self.run_test(
            "Health Check",
            "GET",
            "/api/health",
            200
        )
        return success

    def test_register_trainer(self, name, email, password, specialization):
        """Test trainer registration"""
        print("\n=== Testing Trainer Registration ===")
        success, response = self.run_test(
            "Register Trainer",
            "POST",
            "/api/auth/register/trainer",
            200,
            data={
                "name": name,
                "email": email,
                "password": password,
                "specialization": specialization
            }
        )
        if success and "id" in response:
            self.trainer_id = response["id"]
            print(f"Trainer ID: {self.trainer_id}")
        return success

    def test_login(self, email, password, user_type):
        """Test login and get token"""
        print("\n=== Testing Login ===")
        success, response = self.run_test(
            "Login",
            "POST",
            "/api/auth/login",
            200,
            data={
                "email": email,
                "password": password,
                "user_type": user_type
            }
        )
        if success and "access_token" in response:
            self.token = response["access_token"]
            print(f"Token: {self.token[:20]}...")
            return True
        return False

    def test_get_current_user(self):
        """Test getting current user info"""
        print("\n=== Testing Get Current User ===")
        success, response = self.run_test(
            "Get Current User",
            "GET",
            "/api/auth/me",
            200
        )
        return success

    def test_register_student(self, name, email, password, height, weight, objective):
        """Test student registration"""
        print("\n=== Testing Student Registration ===")
        if not self.trainer_id:
            print("❌ Cannot register student: Trainer ID not available")
            self.test_results.append({"name": "Register Student", "status": "SKIPPED", "details": "Trainer ID not available"})
            return False
            
        success, response = self.run_test(
            "Register Student",
            "POST",
            "/api/auth/register/student",
            200,
            data={
                "name": name,
                "email": email,
                "password": password,
                "trainer_id": self.trainer_id,
                "height": height,
                "weight": weight,
                "objective": objective
            }
        )
        return success

    def test_get_trainer_students(self):
        """Test getting trainer's students"""
        print("\n=== Testing Get Trainer Students ===")
        success, response = self.run_test(
            "Get Trainer Students",
            "GET",
            "/api/trainer/students",
            200
        )
        return success

    def print_summary(self):
        """Print test summary"""
        print("\n=== Test Summary ===")
        print(f"Tests Run: {self.tests_run}")
        print(f"Tests Passed: {self.tests_passed}")
        print(f"Success Rate: {(self.tests_passed / self.tests_run) * 100:.2f}%")
        
        print("\nDetailed Results:")
        for result in self.test_results:
            status_icon = "✅" if result["status"] == "PASSED" else "❌"
            print(f"{status_icon} {result['name']}: {result['status']}")
            if result["status"] != "PASSED":
                print(f"   Details: {result['details']}")

def main():
    # Get backend URL from environment or use default
    backend_url = "http://localhost:8001"
    
    # Read from .env file if it exists
    try:
        with open('/app/.env', 'r') as f:
            for line in f:
                if line.startswith('REACT_APP_BACKEND_URL='):
                    backend_url = line.strip().split('=')[1]
                    print(f"Using backend URL from .env: {backend_url}")
                    break
    except Exception as e:
        print(f"Could not read .env file, using default URL: {backend_url}")
        print(f"Error: {str(e)}")
    
    # Create timestamp for unique email
    timestamp = int(time.time())
    
    # Test data
    trainer_data = {
        "name": "Carlos Silva",
        "email": f"carlos{timestamp}@trainer.com",
        "password": "123456",
        "specialization": "Musculação e Funcional"
    }
    
    student_data = {
        "name": "Maria Santos",
        "email": f"maria{timestamp}@student.com",
        "password": "123456",
        "height": 165,
        "weight": 70,
        "objective": "Emagrecimento"
    }
    
    # Initialize tester
    tester = FitnessAppTester(backend_url)
    
    # Run tests
    health_check_success = tester.test_health_check()
    if not health_check_success:
        print("❌ Health check failed, stopping tests")
        tester.print_summary()
        return 1
    
    register_trainer_success = tester.test_register_trainer(
        trainer_data["name"],
        trainer_data["email"],
        trainer_data["password"],
        trainer_data["specialization"]
    )
    if not register_trainer_success:
        print("❌ Trainer registration failed, stopping tests")
        tester.print_summary()
        return 1
    
    login_success = tester.test_login(
        trainer_data["email"],
        trainer_data["password"],
        "trainer"
    )
    if not login_success:
        print("❌ Login failed, stopping tests")
        tester.print_summary()
        return 1
    
    get_user_success = tester.test_get_current_user()
    if not get_user_success:
        print("❌ Get current user failed, stopping tests")
        tester.print_summary()
        return 1
    
    register_student_success = tester.test_register_student(
        student_data["name"],
        student_data["email"],
        student_data["password"],
        student_data["height"],
        student_data["weight"],
        student_data["objective"]
    )
    if not register_student_success:
        print("❌ Student registration failed, stopping tests")
        tester.print_summary()
        return 1
    
    get_students_success = tester.test_get_trainer_students()
    if not get_students_success:
        print("❌ Get trainer students failed")
        tester.print_summary()
        return 1
    
    # Print summary
    tester.print_summary()
    return 0 if tester.tests_passed == tester.tests_run else 1

if __name__ == "__main__":
    sys.exit(main())