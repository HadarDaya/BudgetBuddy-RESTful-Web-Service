"""
Defines tests for the /api/users/:id GET route.
These tests verify the API returns correct user details and costs.
"""
import requests

BASE_URL = "http://localhost:3000/api/users" # Constant

# Helper function to send GET requests
def get_user(user_id):
    return requests.get(f"{BASE_URL}/{user_id}")

########### 1. UserId validation ###########
# 1.1 userId does not exist
def test_user_id_not_exist():
    response = get_user(999999)  # Assumes this ID does not exist
    assert response.status_code == 404
    assert "error" in response.json()
    assert response.json()["error"] == "User not found"

# 1.2 userId is not a Number type
def test_user_id_not_numeric():
    response = get_user("abc")
    assert response.status_code == 400
    assert "error" in response.json()

# 1.3 Request without userId
def test_user_id_missing():
    response = requests.get(BASE_URL + "/")
    assert response.status_code == 400
    assert "error" in response.json()
    assert response.json()["error"] == "Userid is required"