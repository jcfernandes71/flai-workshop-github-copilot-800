from django.core.management.base import BaseCommand
from octofit_tracker.models import User, Team, Activity, Leaderboard, Workout
from datetime import date


class Command(BaseCommand):
    help = 'Populate the octofit_db database with test data'

    def handle(self, *args, **kwargs):
        # Clear existing data
        self.stdout.write('Clearing existing data...')
        Workout.objects.all().delete()
        Leaderboard.objects.all().delete()
        Activity.objects.all().delete()
        Team.objects.all().delete()
        User.objects.all().delete()

        # --- Users (Superheroes) ---
        self.stdout.write('Creating users...')
        users_data = [
            # Marvel heroes
            {'username': 'iron_man', 'email': 'tony.stark@marvel.com', 'password': 'pbkdf2_marvel_ironman'},
            {'username': 'spider_man', 'email': 'peter.parker@marvel.com', 'password': 'pbkdf2_marvel_spiderman'},
            {'username': 'black_widow', 'email': 'natasha.romanoff@marvel.com', 'password': 'pbkdf2_marvel_widow'},
            {'username': 'thor', 'email': 'thor.odinson@marvel.com', 'password': 'pbkdf2_marvel_thor'},
            {'username': 'captain_america', 'email': 'steve.rogers@marvel.com', 'password': 'pbkdf2_marvel_cap'},
            # DC heroes
            {'username': 'batman', 'email': 'bruce.wayne@dc.com', 'password': 'pbkdf2_dc_batman'},
            {'username': 'superman', 'email': 'clark.kent@dc.com', 'password': 'pbkdf2_dc_superman'},
            {'username': 'wonder_woman', 'email': 'diana.prince@dc.com', 'password': 'pbkdf2_dc_wonderwoman'},
            {'username': 'the_flash', 'email': 'barry.allen@dc.com', 'password': 'pbkdf2_dc_flash'},
            {'username': 'aquaman', 'email': 'arthur.curry@dc.com', 'password': 'pbkdf2_dc_aquaman'},
        ]
        users = {}
        for u in users_data:
            user = User.objects.create(**u)
            users[u['username']] = user
            self.stdout.write(f'  Created user: {user.username}')

        # --- Teams ---
        self.stdout.write('Creating teams...')
        marvel_members = ['iron_man', 'spider_man', 'black_widow', 'thor', 'captain_america']
        dc_members = ['batman', 'superman', 'wonder_woman', 'the_flash', 'aquaman']

        team_marvel = Team.objects.create(name='Team Marvel', members=marvel_members)
        team_dc = Team.objects.create(name='Team DC', members=dc_members)
        self.stdout.write(f'  Created team: {team_marvel.name}')
        self.stdout.write(f'  Created team: {team_dc.name}')

        # --- Activities ---
        self.stdout.write('Creating activities...')
        activities_data = [
            {'user': 'iron_man', 'activity_type': 'Flight Training', 'duration': 45.0, 'date': date(2026, 2, 1)},
            {'user': 'spider_man', 'activity_type': 'Web Swinging', 'duration': 30.0, 'date': date(2026, 2, 2)},
            {'user': 'black_widow', 'activity_type': 'Combat Training', 'duration': 60.0, 'date': date(2026, 2, 3)},
            {'user': 'thor', 'activity_type': 'Hammer Throw', 'duration': 50.0, 'date': date(2026, 2, 4)},
            {'user': 'captain_america', 'activity_type': 'Shield Toss', 'duration': 40.0, 'date': date(2026, 2, 5)},
            {'user': 'batman', 'activity_type': 'Gotham Patrol', 'duration': 90.0, 'date': date(2026, 2, 1)},
            {'user': 'superman', 'activity_type': 'Super Speed Run', 'duration': 20.0, 'date': date(2026, 2, 2)},
            {'user': 'wonder_woman', 'activity_type': 'Lasso Training', 'duration': 55.0, 'date': date(2026, 2, 3)},
            {'user': 'the_flash', 'activity_type': 'Speed Sprints', 'duration': 15.0, 'date': date(2026, 2, 4)},
            {'user': 'aquaman', 'activity_type': 'Ocean Swim', 'duration': 70.0, 'date': date(2026, 2, 5)},
        ]
        for a in activities_data:
            activity = Activity.objects.create(**a)
            self.stdout.write(f'  Created activity: {activity.user} - {activity.activity_type}')

        # --- Leaderboard ---
        self.stdout.write('Creating leaderboard entries...')
        leaderboard_data = [
            {'user': 'iron_man', 'score': 950},
            {'user': 'spider_man', 'score': 870},
            {'user': 'black_widow', 'score': 920},
            {'user': 'thor', 'score': 980},
            {'user': 'captain_america', 'score': 960},
            {'user': 'batman', 'score': 990},
            {'user': 'superman', 'score': 1000},
            {'user': 'wonder_woman', 'score': 975},
            {'user': 'the_flash', 'score': 885},
            {'user': 'aquaman', 'score': 850},
        ]
        for lb in leaderboard_data:
            entry = Leaderboard.objects.create(**lb)
            self.stdout.write(f'  Created leaderboard entry: {entry.user} - {entry.score}')

        # --- Workouts ---
        self.stdout.write('Creating workouts...')
        workouts_data = [
            {
                'name': 'Avengers Endurance Circuit',
                'description': 'High-intensity circuit workout inspired by Marvel Avengers training.',
                'duration': 45,
                'intensity': 'High',
            },
            {
                'name': 'Justice League Strength',
                'description': 'Strength-building routine used by the Justice League heroes.',
                'duration': 60,
                'intensity': 'High',
            },
            {
                'name': 'Spider Agility Drill',
                'description': 'Agility and flexibility workout inspired by Spider-Man.',
                'duration': 30,
                'intensity': 'Medium',
            },
            {
                'name': 'Dark Knight Cardio',
                'description': 'Cardiovascular endurance training modeled after Batman.',
                'duration': 50,
                'intensity': 'Medium',
            },
            {
                'name': 'Asgardian Power Training',
                'description': 'Full-body power exercises inspired by Thor.',
                'duration': 40,
                'intensity': 'High',
            },
            {
                'name': 'Flash Speed Intervals',
                'description': 'Sprint interval training inspired by The Flash.',
                'duration': 20,
                'intensity': 'Very High',
            },
            {
                'name': 'Widow Combat Conditioning',
                'description': 'Combat fitness routine based on Black Widow training.',
                'duration': 35,
                'intensity': 'Medium',
            },
        ]
        for w in workouts_data:
            workout = Workout.objects.create(**w)
            self.stdout.write(f'  Created workout: {workout.name}')

        self.stdout.write(self.style.SUCCESS('Database populated successfully with superhero test data!'))
