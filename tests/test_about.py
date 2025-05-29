"""
Defines tests for the /api/about GET route.
These tests verify the API returns information about the development team.
"""
import requests

BASE_URL = "http://localhost:3000/api/about" # Constant

########### 1. Accessing non-existing route /api/about/123 ###########
def test_about_non_existing_route():
    response = requests.get(BASE_URL + "/123")
    assert response.status_code == 404

########### 2. POST request to /api/about is not supported ###########
def test_about_post_not_allowed():
    response = requests.post(BASE_URL, json={})
    assert response.status_code == 404 or response.status_code == 405

########### 3. GET /api/about returns 200 and JSON array with exactly 2 objects ###########
########### each object contains exactly firstname and lastname fields ###########
def test_about_get_team_members():
    response = requests.get(BASE_URL)
    assert response.status_code == 200

    data = response.json()
    assert isinstance(data, list)
    assert len(data) == 2  # Exactly 2 team members

    for member in data:
        # Each team member has exactly two keys
        assert sorted(member.keys()) == ["first_name", "last_name"]
        assert isinstance(member["first_name"], str)
        assert isinstance(member["last_name"], str)