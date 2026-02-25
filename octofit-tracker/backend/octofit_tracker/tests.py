from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APITestCase
from rest_framework import status
from .models import User, Team, Activity, Leaderboard, Workout
from datetime import date


class UserAPITestCase(APITestCase):
    def setUp(self):
        self.user = User.objects.create(
            username='test_hero',
            email='test_hero@example.com',
            password='testpass123',
        )

    def test_list_users(self):
        response = self.client.get('/api/users/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_create_user(self):
        data = {'username': 'new_hero', 'email': 'new_hero@example.com', 'password': 'pass123'}
        response = self.client.post('/api/users/', data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

    def tearDown(self):
        User.objects.all().delete()


class TeamAPITestCase(APITestCase):
    def setUp(self):
        self.team = Team.objects.create(name='Test Team', members=['hero1', 'hero2'])

    def test_list_teams(self):
        response = self.client.get('/api/teams/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_create_team(self):
        data = {'name': 'New Team', 'members': ['hero3', 'hero4']}
        response = self.client.post('/api/teams/', data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

    def tearDown(self):
        Team.objects.all().delete()


class ActivityAPITestCase(APITestCase):
    def setUp(self):
        self.activity = Activity.objects.create(
            user='test_hero',
            activity_type='Running',
            duration=30.0,
            date=date(2026, 2, 1),
        )

    def test_list_activities(self):
        response = self.client.get('/api/activities/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_create_activity(self):
        data = {
            'user': 'another_hero',
            'activity_type': 'Swimming',
            'duration': 45.0,
            'date': '2026-02-10',
        }
        response = self.client.post('/api/activities/', data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

    def tearDown(self):
        Activity.objects.all().delete()


class LeaderboardAPITestCase(APITestCase):
    def setUp(self):
        self.entry = Leaderboard.objects.create(user='test_hero', score=500)

    def test_list_leaderboard(self):
        response = self.client.get('/api/leaderboard/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_create_leaderboard_entry(self):
        data = {'user': 'another_hero', 'score': 750}
        response = self.client.post('/api/leaderboard/', data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

    def tearDown(self):
        Leaderboard.objects.all().delete()


class WorkoutAPITestCase(APITestCase):
    def setUp(self):
        self.workout = Workout.objects.create(
            name='Test Workout',
            description='A test workout routine.',
            duration=30,
            intensity='Medium',
        )

    def test_list_workouts(self):
        response = self.client.get('/api/workouts/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_create_workout(self):
        data = {
            'name': 'New Workout',
            'description': 'Another workout.',
            'duration': 45,
            'intensity': 'High',
        }
        response = self.client.post('/api/workouts/', data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

    def tearDown(self):
        Workout.objects.all().delete()


class ApiRootTestCase(APITestCase):
    def test_api_root(self):
        response = self.client.get('/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_api_root_at_api(self):
        response = self.client.get('/api/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
