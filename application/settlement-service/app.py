from flask import Flask, jsonify
import boto3
import os
from datetime import datetime

app = Flask(__name__)

# AWS
dynamodb = boto3.resource('dynamodb', region_name=os.getenv('AWS_REGION', 'us-east-1'))
sqs = boto3.client('sqs', region_name=os.getenv('AWS_REGION', 'us-east-1'))

transactions_table = dynamodb.Table(os.getenv('DYNAMODB_TRANSACTIONS_TABLE', 'pix-banking-system-dev-transactions'))
SQS_QUEUE_URL = os.getenv('SQS_QUEUE_URL')

@app.route('/health', methods=['GET'])
def health():
    return jsonify({
        'status': 'healthy',
        'service': 'settlement-service',
        'timestamp': datetime.now().isoformat()
    }), 200

@app.route('/api/settlement/process', methods=['POST'])
def process_settlement():
    try:
        # Process messages from SQS
        if SQS_QUEUE_URL:
            response = sqs.receive_message(
                QueueUrl=SQS_QUEUE_URL,
                MaxNumberOfMessages=10
            )
            
            messages = response.get('Messages', [])
            processed = 0
            
            for message in messages:
                # Process message
                sqs.delete_message(
                    QueueUrl=SQS_QUEUE_URL,
                    ReceiptHandle=message['ReceiptHandle']
                )
                processed += 1
            
            return jsonify({
                'message': 'Settlement processed',
                'messagesProcessed': processed
            }), 200
        
        return jsonify({'message': 'No queue configured'}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/settlement/report', methods=['GET'])
def get_report():
    try:
        # Scan transactions (simplified)
        response = transactions_table.scan(Limit=100)
        transactions = response.get('Items', [])
        
        total = sum(float(t.get('amount', 0)) for t in transactions)
        
        return jsonify({
            'totalTransactions': len(transactions),
            'totalAmount': total,
            'generatedAt': datetime.now().isoformat()
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=3000)