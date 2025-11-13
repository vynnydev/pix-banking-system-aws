from flask import Flask, request, jsonify
import boto3
import redis
import os
from datetime import datetime
import uuid

app = Flask(__name__)

# AWS DynamoDB
dynamodb = boto3.resource('dynamodb', region_name=os.getenv('AWS_REGION', 'us-east-1'))
users_table = dynamodb.Table(os.getenv('DYNAMODB_USERS_TABLE', 'pix-banking-system-dev-users'))
accounts_table = dynamodb.Table(os.getenv('DYNAMODB_ACCOUNTS_TABLE', 'pix-banking-system-dev-accounts'))

# Redis
redis_client = redis.Redis(
    host=os.getenv('REDIS_HOST', 'localhost'),
    port=int(os.getenv('REDIS_PORT', 6379)),
    decode_responses=True
)

@app.route('/health', methods=['GET'])
def health():
    return jsonify({
        'status': 'healthy',
        'service': 'auth-service',
        'timestamp': datetime.now().isoformat()
    }), 200

@app.route('/api/auth/register', methods=['POST'])
def register():
    try:
        data = request.get_json()
        user_id = str(uuid.uuid4())
        account_id = str(uuid.uuid4())
        
        # Create user
        users_table.put_item(Item={
            'userId': user_id,
            'email': data.get('email'),
            'name': data.get('name'),
            'cpf': data.get('cpf'),
            'createdAt': datetime.now().isoformat()
        })
        
        # Create account
        accounts_table.put_item(Item={
            'accountId': account_id,
            'userId': user_id,
            'balance': 1000.00,
            'createdAt': datetime.now().isoformat()
        })
        
        return jsonify({
            'message': 'User registered successfully',
            'userId': user_id,
            'accountId': account_id
        }), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/auth/login', methods=['POST'])
def login():
    try:
        data = request.get_json()
        
        # Simple mock authentication
        token = str(uuid.uuid4())
        
        # Cache token in Redis
        redis_client.setex(f"token:{token}", 3600, data.get('email'))
        
        return jsonify({
            'message': 'Login successful',
            'token': token
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/auth/users/<user_id>', methods=['GET'])
def get_user(user_id):
    try:
        response = users_table.get_item(Key={'userId': user_id})
        if 'Item' in response:
            return jsonify(response['Item']), 200
        return jsonify({'error': 'User not found'}), 404
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=3000)