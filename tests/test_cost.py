"""
Defines tests for the /api/add POST route.
These tests cover input validation, default value handling, and response structure verification for adding cost items.
"""
import pytest
import requests
from datetime import datetime

BASE_URL = "http://localhost:3000/api/add" # Constant

# Helper function to send POST requests
def post_cost(data):
    return requests.post(BASE_URL, json=data)

############ 1. Missing required parameters ############
# 1.1 Missing required parameter: description
def test_missing_description():
    # Provide category, userid, sum but omit description
    data = {
        "category": "food",
        "userid": 456456,
        "sum": 10
    }
    response = post_cost(data)
    assert response.status_code == 400
    assert "error" in response.json()

# 1.2 Missing multiple required fields (only category provided)
def test_missing_multiple_fields():
    data = {
        "category": "food"
    }
    response = post_cost(data)
    assert response.status_code == 400
    assert "error" in response.json()

########### 2. Wrong data type for parameters ###########
# 2.1 sum provided as a string instead of a number
def test_sum_as_string():
    data = {
        "description": "Lunch",
        "category": "food",
        "userid": 456456,
        "sum": "abc"  # Invalid type
    }
    response = post_cost(data)
    assert response.status_code == 400
    assert "error" in response.json()

# 2.2 userid provided as a string with non-numeric characters (should fail)
def test_userid_as_invalid_number():
    data = {
        "description": "Lunch",
        "category": "food",
        "userid": "ab!34",   # Invalid: contains non-digit character
        "sum": 50
    }
    response = post_cost(data)
    assert response.status_code == 400
    assert "error" in response.json()

# 2.3 userid provided as a numeric string (should be accepted)
def test_userid_as_numeric_string():
    data = {
        "description": "Valid UserID String",
        "category": "food",
        "userid": "1234",  # Valid numeric string
        "sum": 20
    }
    response = post_cost(data)
    assert response.status_code == 201
    assert "cost" in response.json()
    assert response.json()["cost"]["userid"] == 1234

########### 3. Sum validation ###########
# 3.1 sum is negative (allowed)
def test_negative_sum():
    data = {
        "description": "Refund",
        "category": "food",
        "userid": 456456,
        "sum": -5
    }
    response = post_cost(data)
    assert response.status_code == 201
    assert "cost" in response.json()

# 3.2 sum is small positive number (0.10), should be accepted
def test_sum_too_small():
    data = {
        "description": "Tiny amount",
        "category": "food",
        "userid": 456456,
        "sum": 0.10
    }
    response = post_cost(data)
    # Expect success here
    assert response.status_code == 201, f"Expected 201, got {response.status_code}"
    json_data = response.json()
    assert "cost" in json_data
    assert json_data["cost"]["sum"] == pytest.approx(0.10)

########### 4. Category validation ###########
# 4.1 Invalid category value (not in allowed list)
def test_invalid_category():
    data = {
        "description": "Coffee",
        "category": "luxury",  # Not in allowed category
        "userid": 456456,
        "sum": 15
    }
    response = post_cost(data)
    assert response.status_code == 400
    assert "error" in response.json()

# 4.2 Category provided in uppercase should be converted to lowercase
def test_uppercase_category():
    data = {
        "description": "Gym",
        "category": "FOOD",  # Should be converted to "food"
        "userid": 456456,
        "sum": 50
    }
    response = post_cost(data)
    assert response.status_code == 201
    assert response.json()["cost"]["category"] == "food"

########### 5. Default date ###########
# 5.1 Default date applied if no date fields are provided
def test_default_date_applied():
    data = {
        "description": "Groceries",
        "category": "food",
        "userid": 456456,
        "sum": 100
    }
    response = post_cost(data)
    today = datetime.now()
    assert response.status_code == 201
    json = response.json()["cost"]
    # Validate that day, month, year default to today’s date
    assert json["day"] == today.day
    assert json["month"] == today.month
    assert json["year"] == today.year

# 5.2 Partial date provided (day and year), missing month should default
def test_partial_date_defaults():
    data = {
        "description": "Partial date test",
        "category": "food",
        "userid": 456456,
        "sum": 50,
        "day": 15,
        "year": 2025
        # month omitted intentionally
    }
    response = post_cost(data)
    assert response.status_code == 201
    cost = response.json()["cost"]

    today = datetime.now()

    # Assert provided day and year remain unchanged
    assert cost["day"] == 15
    assert cost["year"] == 2025
    # Assert month defaulted to current month
    assert cost["month"] == today.month

########### 6. Date format validation ###########
# 6.1 Invalid leap year date (Feb 29 on a non-leap year)
def test_invalid_leap_date():
    data = {
        "description": "Weird date",
        "category": "food",
        "userid": 456456,
        "sum": 15,
        "day": 29,
        "month": 2,
        "year": 2023  # 2023 Not a leap year
    }
    response = post_cost(data)
    assert response.status_code == 400
    assert "error" in response.json()

 # 6.2. Nonexistent date (e.g. day 32)
def test_day_out_of_range():
     data = {
         "description": "Invalid day",
         "category": "food",
         "userid": 456456,
         "sum": 25,
         "day": 32,
         "month": 5,
         "year": 2024
     }
     response = post_cost(data)
     assert response.status_code == 400
     assert "error" in response.json()

########### 7. Error response format ###########
# Any error should return JSON with error key
def test_error_response_format():
     data = {
         "category": "food",
         "userid": 456456,
         "sum": -10
     }
     response = post_cost(data)
     assert response.status_code == 400
     assert isinstance(response.json(), dict)
     assert "error" in response.json()

########### 8. Response JSON structure ###########
# The returned JSON cost document should have all expected fields
def test_valid_response_structure():
    data = {
        "description": "Bus",
        "category": "food",
        "userid": 456456,
        "sum": 8,
        "day": 1,
        "month": 4,
        "year": 2025
    }
    response = post_cost(data)
    assert response.status_code == 201
    json = response.json()["cost"]
    for field in ["description", "category", "userid", "sum", "day", "month", "year"]:
        assert field in json

