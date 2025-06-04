"""
Defines tests for the /api/report GET route.
These tests verify the API handles query parameters validation and returns cost reports correctly.
"""
import requests

BASE_URL = "http://localhost:3000/api/report" # Constant

# Helper function to send GET requests with query params
def get_report(params):
    return requests.get(BASE_URL, params=params)

############ 1. Missing required parameters ############
# 1.1 Missing required parameter: id
def test_missing_id():
    params = {"year": 2025, "month": 5}
    response = get_report(params)
    assert response.status_code == 400
    json = response.json()
    assert "error" in json

# 1.2 Missing required parameter: year
def test_missing_year():
    params = {"id": 123123, "month": 5}
    response = get_report(params)
    assert response.status_code == 400
    json = response.json()
    assert "error" in json

# 1.3 Missing multiple required fields (only is provided)
def test_missing_multiple_fields():
    params = {"id": 123123}
    response = get_report({})
    assert response.status_code == 400
    json = response.json()
    assert "error" in json

########### 2. Wrong data type for parameters ###########
# 2.1 year and month provided as a string when number expected
def test_non_numeric_multiple_fields():
    params = {"id": 123123, "year": "abcd", "month": "xyz"}
    response = get_report(params)
    assert response.status_code == 400
    json = response.json()
    assert "error" in json

# 2.2 id provided as a string with non-numeric characters (should fail)
def test_id_as_invalid_number():
    data = {"id": "ab!3", "year": "abcd", "month": "xyz"}
    response = get_report(data)
    assert response.status_code == 400
    json = response.json()
    assert "error" in json

############ 3. Non-existing id ############
# Request with an id that does not exist in the database
def test_non_existing_id():
    params = {"id": 9999999, "year": 2025, "month": 5}
    response = get_report(params)
    assert response.status_code == 200
    expected_data = {
        "userid": 9999999,
        "year": 2025,
        "month": 5,
        "costs": [
            {"food": []},
            {"health": []},
            {"housing": []},
            {"sport": []},
            {"education": []}
        ]
    }
    json_data = response.json()
    assert json_data == expected_data

############ 4. Month out of range ############
# Month not in the valid range
def test_month_out_of_range():
    params = {"id": 123123, "year": 2025, "month": 0}
    response = get_report(params)
    assert response.status_code == 400
    json = response.json()
    assert "error" in json
    assert "month" in json["error"].lower()


############ 5. Valid request but no data for the given month,year ############
# Valid id, year, month but no matching cost items
def test_valid_no_data():
    params = {"id": 123123, "year": 2024, "month": 2}
    response = get_report(params)
    assert response.status_code == 200
    json = response.json()
    # Expect categories field with empty items lists
    assert "costs" in json
    for cat in json["costs"]:
        category_name = list(cat.keys())[0]
        items = cat[category_name]
        assert isinstance(items, list)
        assert len(items) == 0

############ 6. Valid request with existing data ############
# Valid id, year, month with data in database
def test_valid_with_data():
    params = {"id": 123123, "year": 2025, "month": 2}
    response = get_report(params)
    assert response.status_code == 200
    json = response.json()
    # Check main keys and values
    assert json.get("userid")== 123123
    assert json.get("year") == 2025
    assert json.get("month") == 2
    # Check categories field and its structure
    assert "costs" in json
    for cat in json["costs"]:
        category_name = list(cat.keys())[0]
        items = cat[category_name]
        assert isinstance(items, list)
        # Check required fields for each item if exists
        for item in items:
            for field in ["sum", "description", "day"]:
                assert field in item
