import Bluebird from 'bluebird';
import config from '../../../config';

export const getDetailsCards = async (req, res) => {
  const result = [];
  const validCards = config.dashboard.availableCards;
  const userData = req.userData;
  await Bluebird.map(validCards, (cardTitle) => {
    const title = cardTitle.toLowerCase();
    switch (title) {
      case 'remaining credits': {
        const value = userData.totalCredit || 0;
        result.push({
          title: cardTitle,
          value: `${value} credits`,
        });
        break;
      }
      case 'auto-replied': {
        const value = 0;
        result.push({
          title: cardTitle,
          value: `${value} messages`,
        });
        break;
      }
      case 'pending replies': {
        const value = 0;
        result.push({
          title: cardTitle,
          value: `${value} messages`,
        });
        break;
      }
      case 'failed replies': {
        const value = 0;
        result.push({
          title: cardTitle,
          value: `${value} messages`,
        });
        break;
      }
      default: {
        result.push({
          title: cardTitle,
          value: '',
        });
        break;
      }
    }
  });
  res.send({
    message: 'Dashboard Cards Fetch SuccessFully',
    response: {
      cards: result,
    },
  });
};

export const getTaskDetails = async (req, res) => {
  const result = {};
  const tasks = config.dashboard.availableTasks;

  await Bluebird.map(tasks, (taskKey) => {
    switch (taskKey) {
      case 'reconnect': {
        const numAccount = 0;
        result[taskKey] = numAccount;
        break;
      }
      case 'credits': {
        const userData = req.userData;
        const value = userData.totalCredit || 0;
        const numCredit = value;
        result[taskKey] = numCredit;
        break;
      }
      case 'knowledge': {
        const numAccount = true;
        result[taskKey] = numAccount;
        break;
      }
      default:
        null;
    }
  });

  res.send({
    message: 'Dashboard Task Fetch SuccessFully',
    response: {
      tasks: result,
    },
  });
};

export const getWeeklyData = async (req, res) => {
  const weekDay = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const result = [];
  // const getTodayName = (currentDate = new Date()) => {
  //   const dayIndex = currentDate.getDay();
  //   return weekDay[dayIndex];
  // };
  // const currentDate = new Date();
  // const weekBefore = currentDate.setDate(currentDate.getDate() - 7);

  weekDay.forEach((day) => {
    result.push({ name: day, auto: 0, pending: 0, failed: 0 });
  });

  res.send({
    message: 'weekly Performance Fetch SuccessFully',
    response: {
      performance: result,
    },
  });
};

export const getRecentConversation = async (req, res) => {
  const result = [
    // { id: 1, name: 'Anna Jones', status: 'Auto-replied' },
    // { id: 2, name: 'David Smith', status: 'Pending' },
    // { id: 3, name: 'Sarah Johnson', status: 'Pending' },
    // { id: 4, name: 'John Doe', status: 'Auto-replied' },
    // { id: 5, name: 'Emily Davis', status: 'Failed' },
  ];

  res.send({
    message: 'Recent Conversations Fetch SuccessFully',
    response: {
      conversation: result,
    },
  });
};
