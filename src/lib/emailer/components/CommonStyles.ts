export const commonEmailStyles = `
    <style>
        .email-body {
            padding: 40px 30px;
            background-color: #ffffff;
        }
        
        .greeting-text {
            font-size: 18px;
            color: #1f2937;
            margin-bottom: 20px;
            font-weight: 500;
        }
        
        .main-message {
            font-size: 16px;
            color: #374151;
            line-height: 1.6;
            margin-bottom: 30px;
        }
        
        .detail-container {
            margin: 30px 0;
            background-color: #f9fafb;
            border-radius: 8px;
            padding: 24px;
        }
        
        .detail-title {
            font-size: 24px;
            font-weight: 700;
            color: #1f2937;
            margin-bottom: 20px;
            text-align: center;
        }
        
        .detail-row {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 12px 0;
            border-bottom: 1px solid #e5e7eb;
        }
        
        .detail-row:last-child {
            border-bottom: none;
        }
        
        .detail-label {
            font-weight: 600;
            color: #6b7280;
            font-size: 14px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        
        .detail-value {
            font-size: 16px;
            color: #1f2937;
            font-weight: 500;
        }
        
        .highlight-box {
            margin-bottom: 20px;
            background-color: rgb(240, 236, 255);
            padding: 15px;
            border-radius: 6px;
            border-left: 4px solid rgb(93, 74, 152);
        }
        
        .highlight-label {
            font-weight: 700;
            color: rgb(93, 74, 152);
        }
        
        .highlight-value {
            font-size: 18px;
            font-weight: 700;
            letter-spacing: 2px;
            color: rgb(93, 74, 152);
        }
        
        .primary-button {
            display: inline-block;
            background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
            color: #ffffff;
            text-decoration: none;
            padding: 12px 24px;
            border-radius: 8px;
            font-weight: 600;
            font-size: 14px;
            margin: 20px 0;
            transition: all 0.2s ease;
            box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
        }
        
        .primary-button:hover {
            background: linear-gradient(135deg, #1d4ed8 0%, #1e40af 100%);
            transform: translateY(-2px);
            box-shadow: 0 8px 25px rgba(59, 130, 246, 0.4);
        }
        
        .cta-section {
            text-align: center;
            margin: 40px 0;
        }
        
        .cta-button {
            display: inline-block;
            background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
            color: #ffffff;
            text-decoration: none;
            padding: 14px 28px;
            border-radius: 10px;
            font-weight: 600;
            font-size: 16px;
            transition: all 0.2s ease;
            box-shadow: 0 4px 12px rgba(245, 158, 11, 0.3);
        }
        
        .cta-button:hover {
            background: linear-gradient(135deg, #d97706 0%, #b45309 100%);
            transform: translateY(-3px);
            box-shadow: 0 8px 25px rgba(245, 158, 11, 0.4);
        }
        
        .closing-text {
            font-size: 16px;
            color: #374151;
            margin: 30px 0 10px 0;
            font-weight: 500;
        }
        
        .signature-text {
            font-size: 16px;
            color: #1f2937;
            font-weight: 600;
            margin: 0 0 40px 0;
        }
        
        .info-box {
            background: #f3f4f6;
            padding: 16px;
            border-radius: 8px;
            margin: 20px 0;
            border-left: 4px solid #3b82f6;
        }
        
        .success-box {
            background: #f0fdf4;
            padding: 16px;
            border-radius: 8px;
            margin: 20px 0;
            border-left: 4px solid #10b981;
        }
        
        .warning-box {
            background: #fffbeb;
            padding: 16px;
            border-radius: 8px;
            margin: 20px 0;
            border-left: 4px solid #f59e0b;
        }
        
        @media (max-width: 600px) {
            .email-body {
                padding: 30px 20px;
            }
            
            .detail-row {
                flex-direction: column;
                align-items: flex-start;
                gap: 5px;
            }
            
            .cta-button,
            .primary-button {
                display: block;
                width: 100%;
                text-align: center;
                margin: 10px 0;
            }
        }
    </style>
`;

