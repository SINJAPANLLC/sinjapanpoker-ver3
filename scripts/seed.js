// データベースシードスクリプト
// 開発用のテストデータを生成します

const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/poker-app';

async function seed() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('MongoDB接続成功');

    // ここにシードデータを追加
    console.log('シードデータの投入を開始...');

    // ユーザーの作成例
    const User = mongoose.model('User', new mongoose.Schema({
      email: String,
      username: String,
      password: String,
      chips: Number,
      level: Number,
      experience: Number,
    }));

    const existingUser = await User.findOne({ email: 'demo@example.com' });
    
    if (!existingUser) {
      // パスワードは実際にはハッシュ化する必要があります
      const bcrypt = require('bcryptjs');
      const hashedPassword = await bcrypt.hash('demo123', 10);
      
      await User.create({
        email: 'demo@example.com',
        username: 'DemoPlayer',
        password: hashedPassword,
        chips: 100000,
        level: 5,
        experience: 500,
      });
      
      console.log('デモユーザーを作成しました');
      console.log('Email: demo@example.com');
      console.log('Password: demo123');
    } else {
      console.log('デモユーザーは既に存在します');
    }

    console.log('シードデータの投入が完了しました');
    process.exit(0);
  } catch (error) {
    console.error('エラー:', error);
    process.exit(1);
  }
}

seed();

