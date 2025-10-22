import { NextApiRequest, NextApiResponse } from 'next';

interface RevenueData {
  totalRake: number;
  totalTournamentFees: number;
  totalRevenue: number;
  gameCount: number;
  tournamentCount: number;
  dailyRevenue: Array<{
    date: string;
    rake: number;
    fees: number;
    total: number;
  }>;
}

// モックデータ（実際の実装ではデータベースから取得）
const mockRevenueData: RevenueData = {
  totalRake: 15420,
  totalTournamentFees: 8930,
  totalRevenue: 24350,
  gameCount: 1247,
  tournamentCount: 156,
  dailyRevenue: [
    { date: '2025-01-01', rake: 450, fees: 320, total: 770 },
    { date: '2025-01-02', rake: 520, fees: 280, total: 800 },
    { date: '2025-01-03', rake: 380, fees: 450, total: 830 },
    { date: '2025-01-04', rake: 620, fees: 380, total: 1000 },
    { date: '2025-01-05', rake: 490, fees: 520, total: 1010 },
    { date: '2025-01-06', rake: 580, fees: 340, total: 920 },
    { date: '2025-01-07', rake: 410, fees: 480, total: 890 },
  ],
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    const { period = '7days' } = req.query;

    // 期間に応じてデータをフィルタリング
    let filteredData = { ...mockRevenueData };
    
    if (period === '24hours') {
      filteredData.dailyRevenue = filteredData.dailyRevenue.slice(-1);
    } else if (period === '30days') {
      // 30日分のデータを生成（モック）
      const thirtyDaysData = [];
      for (let i = 29; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        thirtyDaysData.push({
          date: date.toISOString().split('T')[0],
          rake: Math.floor(Math.random() * 600) + 300,
          fees: Math.floor(Math.random() * 400) + 200,
          total: 0,
        });
      }
      thirtyDaysData.forEach(day => {
        day.total = day.rake + day.fees;
      });
      filteredData.dailyRevenue = thirtyDaysData;
    }

    return res.status(200).json(filteredData);
  }

  return res.status(405).json({ message: 'Method Not Allowed' });
}
