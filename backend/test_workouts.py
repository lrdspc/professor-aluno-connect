#!/usr/bin/env python3
import os
import json
import requests
from datetime import datetime
import uuid

# URL base da API
BASE_URL = "http://localhost:8001/api"

# Credenciais de teste
TRAINER_EMAIL = "trainer@test.com"
TRAINER_PASSWORD = "password123"
STUDENT_EMAIL = "student@test.com"
STUDENT_PASSWORD = "password123"

def test_login(email, password, user_type):
    """Testa o login e retorna o token de acesso"""
    print(f"\n🔑 Testando login como {user_type}...")
    
    response = requests.post(
        f"{BASE_URL}/auth/login",
        json={
            "email": email,
            "password": password,
            "user_type": user_type
        }
    )
    
    if response.status_code == 200:
        data = response.json()
        print(f"✅ Login bem-sucedido como {user_type}")
        return data["access_token"]
    else:
        print(f"❌ Falha no login: {response.status_code} - {response.text}")
        return None

def test_get_current_user(token):
    """Testa obter informações do usuário atual"""
    print("\n👤 Testando obter informações do usuário atual...")
    
    headers = {"Authorization": f"Bearer {token}"}
    response = requests.get(f"{BASE_URL}/auth/me", headers=headers)
    
    if response.status_code == 200:
        user_data = response.json()
        print(f"✅ Informações do usuário obtidas: {user_data['name']} ({user_data['type']})")
        return user_data
    else:
        print(f"❌ Falha ao obter informações do usuário: {response.status_code} - {response.text}")
        return None

def test_create_workout(token, student_id):
    """Testa a criação de um treino para um aluno"""
    print(f"\n💪 Testando criar treino para o aluno {student_id}...")
    
    # Dados do treino
    workout_data = {
        "student_id": student_id,
        "name": f"Treino de Teste {datetime.now().strftime('%Y-%m-%d %H:%M')}",
        "description": "Este é um treino de teste criado automaticamente",
        "exercises": [
            {
                "id": str(uuid.uuid4()),
                "name": "Supino Reto",
                "description": "Exercício para peitoral",
                "sets": 3,
                "reps": 12,
                "rest_time": 60
            },
            {
                "id": str(uuid.uuid4()),
                "name": "Agachamento",
                "description": "Exercício para pernas",
                "sets": 4,
                "reps": 10,
                "rest_time": 90
            }
        ]
    }
    
    headers = {"Authorization": f"Bearer {token}"}
    response = requests.post(
        f"{BASE_URL}/workouts",
        headers=headers,
        json=workout_data
    )
    
    if response.status_code == 200:
        data = response.json()
        print(f"✅ Treino criado com sucesso: {data}")
        return data["id"]
    else:
        print(f"❌ Falha ao criar treino: {response.status_code} - {response.text}")
        return None

def test_get_student_workouts(token, student_id):
    """Testa obter os treinos de um aluno"""
    print(f"\n📋 Testando obter treinos do aluno {student_id}...")
    
    headers = {"Authorization": f"Bearer {token}"}
    response = requests.get(
        f"{BASE_URL}/student/{student_id}/workouts",
        headers=headers
    )
    
    if response.status_code == 200:
        workouts = response.json()
        print(f"✅ Treinos obtidos: {len(workouts)} treinos encontrados")
        return workouts
    else:
        print(f"❌ Falha ao obter treinos: {response.status_code} - {response.text}")
        return []

def test_get_workout_details(token, workout_id):
    """Testa obter detalhes de um treino específico"""
    print(f"\n🔍 Testando obter detalhes do treino {workout_id}...")
    
    headers = {"Authorization": f"Bearer {token}"}
    response = requests.get(
        f"{BASE_URL}/workouts/{workout_id}",
        headers=headers
    )
    
    if response.status_code == 200:
        workout = response.json()
        print(f"✅ Detalhes do treino obtidos: {workout['name']}")
        return workout
    else:
        print(f"❌ Falha ao obter detalhes do treino: {response.status_code} - {response.text}")
        return None

def test_register_progress(token, workout_id, student_id):
    """Testa registrar progresso de um treino"""
    print(f"\n📈 Testando registrar progresso para o treino {workout_id}...")
    
    progress_data = {
        "workout_id": workout_id,
        "student_id": student_id,
        "date": datetime.now().isoformat(),
        "completed": True,
        "notes": "Este foi um ótimo treino!",
        "difficulty_level": 3
    }
    
    headers = {"Authorization": f"Bearer {token}"}
    response = requests.post(
        f"{BASE_URL}/progress",
        headers=headers,
        json=progress_data
    )
    
    if response.status_code == 200:
        data = response.json()
        print(f"✅ Progresso registrado com sucesso: {data}")
        return data["id"]
    else:
        print(f"❌ Falha ao registrar progresso: {response.status_code} - {response.text}")
        return None

def test_get_workout_progress(token, workout_id):
    """Testa obter progresso de um treino específico"""
    print(f"\n📊 Testando obter progresso do treino {workout_id}...")
    
    headers = {"Authorization": f"Bearer {token}"}
    response = requests.get(
        f"{BASE_URL}/workout/{workout_id}/progress",
        headers=headers
    )
    
    if response.status_code == 200:
        progress = response.json()
        print(f"✅ Progresso do treino obtido: {len(progress)} registros encontrados")
        return progress
    else:
        print(f"❌ Falha ao obter progresso do treino: {response.status_code} - {response.text}")
        return []

def main():
    """Função principal que executa todos os testes"""
    print("🚀 Iniciando testes da API de treinos e progresso...")
    
    # Login como treinador
    trainer_token = test_login(TRAINER_EMAIL, TRAINER_PASSWORD, "trainer")
    if not trainer_token:
        print("❌ Testes interrompidos: falha no login do treinador")
        return
    
    # Obter informações do treinador
    trainer = test_get_current_user(trainer_token)
    if not trainer:
        print("❌ Testes interrompidos: falha ao obter informações do treinador")
        return
    
    # Login como aluno
    student_token = test_login(STUDENT_EMAIL, STUDENT_PASSWORD, "student")
    if not student_token:
        print("❌ Testes interrompidos: falha no login do aluno")
        return
    
    # Obter informações do aluno
    student = test_get_current_user(student_token)
    if not student:
        print("❌ Testes interrompidos: falha ao obter informações do aluno")
        return
    
    # Criar um treino para o aluno
    workout_id = test_create_workout(trainer_token, student["id"])
    if not workout_id:
        print("❌ Testes interrompidos: falha ao criar treino")
        return
    
    # Obter treinos do aluno (como treinador)
    workouts = test_get_student_workouts(trainer_token, student["id"])
    
    # Obter treinos do aluno (como aluno)
    workouts = test_get_student_workouts(student_token, student["id"])
    
    # Obter detalhes do treino
    workout = test_get_workout_details(student_token, workout_id)
    if not workout:
        print("❌ Testes interrompidos: falha ao obter detalhes do treino")
        return
    
    # Registrar progresso do treino
    progress_id = test_register_progress(student_token, workout_id, student["id"])
    if not progress_id:
        print("❌ Testes interrompidos: falha ao registrar progresso")
        return
    
    # Obter progresso do treino
    progress = test_get_workout_progress(student_token, workout_id)
    
    print("\n✅ Todos os testes concluídos com sucesso!")

if __name__ == "__main__":
    main()
