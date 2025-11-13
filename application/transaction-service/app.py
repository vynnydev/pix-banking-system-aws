from flask import Flask, request, jsonify
import boto3
import redis
import os
from datetime import datetime
import uuid
from decimal import Decimal

app = Flask(__name__)

# AWS
dynamodb = boto3.resource('dynamodb', region_name=os.getenv('AWS_REGION', 'us-east-1'))
sns = boto3.client('sns', region_name=os.getenv('AWS_REGION', 'us-east-1'))

transactions_table = dynamodb.Table(os.getenv('DYNAMODB_TRANSACTIONS_TABLE', 'pix-banking-system-dev-transactions'))
accounts_table = dynamodb.Table(os.getenv('DYNAMODB_ACCOUNTS_TABLE', 'pix-banking-system-dev-accounts'))

# Redis
redis_client = redis.Redis(
    host=os.getenv('REDIS_HOST', 'localhost'),
    port=int(os.getenv('REDIS_PORT', 6379)),
    decode_responses=True
)

SNS_TOPIC_ARN = os.getenv('SNS_TOPIC_ARN')

@app.route('/health', methods=['GET'])
def health():
    return jsonify({
        'status': 'healthy',
        'service': 'transaction-service',
        'timestamp': datetime.now().isoformat()
    }), 200

@app.route('/api/transactions', methods=['POST'])
def create_transaction():
    try:
        data = request.get_json()
        transaction_id = str(uuid.uuid4())
        
        # Get accounts
        sender = accounts_table.get_item(Key={'accountId': data['fromAccountId']})
        receiver = accounts_table.get_item(Key={'accountId': data['toAccountId']})
        
        if 'Item' not in sender or 'Item' not in receiver:
            return jsonify({'error': 'Account not found'}), 404
        
        amount = Decimal(str(data['amount']))
        sender_balance = Decimal(str(sender['Item']['balance']))
        
        if sender_balance < amount:
            return jsonify({'error': 'Insufficient funds'}), 400
        
        # Update balances
        accounts_table.update_item(
            Key={'accountId': data['fromAccountId']},
            UpdateExpression='SET balance = balance - :amount',
            ExpressionAttributeValues={':amount': amount}
        )
        
        accounts_table.update_item(
            Key={'accountId': data['toAccountId']},
            UpdateExpression='SET balance = balance + :amount',
            ExpressionAttributeValues={':amount': amount}
        )
        
        # Create transaction
        transactions_table.put_item(Item={
            'transactionId': transaction_id,
            'fromAccountId': data['fromAccountId'],
            'toAccountId': data['toAccountId'],
            'amount': float(amount),
            'status': 'completed',
            'createdAt': datetime.now().isoformat()
        })
        
        # Publish to SNS
        if SNS_TOPIC_ARN:
            sns.publish(
                TopicArn=SNS_TOPIC_ARN,
                Message=f"Transaction {transaction_id} completed",
                Subject='PIX Transaction'
            )
        
        # Cache in Redis
        redis_client.setex(f"transaction:{transaction_id}", 3600, 'completed')
        
        return jsonify({
            'message': 'Transaction completed',
            'transactionId': transaction_id
        }), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/transactions/<transaction_id>', methods=['GET'])
def get_transaction(transaction_id):
    try:
        # Check cache first
        cached = redis_client.get(f"transaction:{transaction_id}")
        if cached:
            response = transactions_table.get_item(Key={'transactionId': transaction_id})
            if 'Item' in response:
                return jsonify(response['Item']), 200
        
        response = transactions_table.get_item(Key={'transactionId': transaction_id})
        if 'Item' in response:
            return jsonify(response['Item']), 200
        return jsonify({'error': 'Transaction not found'}), 404
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=3000)