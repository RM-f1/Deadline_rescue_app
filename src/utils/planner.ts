import { GoogleGenerativeAI } from '@google/generative-ai';

const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
export interface ScheduleItem {
  day: number;
  date: string;
  goal: string;
  hours: number;
  isToday: boolean;
  warning: boolean;
  isBuffer?: boolean;
  completed?: boolean;
}

export interface TaskInput {
  name: string;
  description: string;
  deadline: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  hoursPerDay: number;
}

export async function generatePlan(task: TaskInput): Promise<ScheduleItem[]> {
  if (!apiKey) {
    console.warn('No Gemini API key found, using mock data');
    return generateMockPlan(task);
  }

 const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

  const today = new Date();
  const todayStr = today.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric'
  });

  const prompt = `I have a task: ${task.name}.
Description: ${task.description || 'No additional description provided'}.
Deadline: ${task.deadline}.
Difficulty: ${task.difficulty}.
I can work ${task.hoursPerDay} hours per day.
Today is ${todayStr}.

Break this into a realistic day-by-day schedule from today until the deadline. Consider difficulty when dividing workload (Hard = more hours/day, Easy = fewer). Add 1-2 buffer/revision days before the deadline. Mark today as Start Here with isToday: true. If the deadline is too close (less than 2 days), set warning: true and give the best compressed plan.

Return ONLY a valid JSON array (no markdown, no code blocks). Each object must have exactly these fields:
{
  "day": number,
  "date": "Day Mon DD" format,
  "goal": "clear, actionable objective",
  "hours": number,
  "isToday": boolean,
  "warning": boolean,
  "isBuffer": boolean
}

JSON array only, no other text:`;

  try {
    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();

    // Clean up the response - remove markdown code blocks if present
    let cleanedText = text.trim();
    if (cleanedText.startsWith('```json')) {
      cleanedText = cleanedText.slice(7);
    } else if (cleanedText.startsWith('```')) {
      cleanedText = cleanedText.slice(3);
    }
    if (cleanedText.endsWith('```')) {
      cleanedText = cleanedText.slice(0, -3);
    }
    cleanedText = cleanedText.trim();

    const schedule: ScheduleItem[] = JSON.parse(cleanedText);
    return schedule.map(item => ({ ...item, completed: false }));
  } catch (error) {
    console.error('Gemini API error:', error);
    return generateMockPlan(task);
  }
}

function generateMockPlan(task: TaskInput): ScheduleItem[] {
  const today = new Date();
  const deadline = new Date(task.deadline);
  const daysUntilDeadline = Math.ceil((deadline.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

  const hoursPerDay = task.hoursPerDay;
  const difficultyMultiplier = task.difficulty === 'Hard' ? 1.5 : task.difficulty === 'Easy' ? 0.7 : 1;
  const adjustedHours = Math.round(hoursPerDay * difficultyMultiplier * 10) / 10;

  const schedule: ScheduleItem[] = [];
  const totalDays = Math.max(daysUntilDeadline, 1);
  const bufferDays = totalDays > 3 ? 2 : totalDays > 1 ? 1 : 0;
  const workDays = Math.max(totalDays - bufferDays, 1);

  for (let i = 0; i < totalDays; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() + i);

    const dateStr = date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });

    const isBuffer = i >= workDays && i < totalDays - 1;
    const isLastDay = i === totalDays - 1;
    const warning = totalDays <= 2;

    let goal: string;
    if (i === 0) {
      goal = `Research and outline the ${task.name} project`;
    } else if (isBuffer) {
      goal = 'Review and refine completed work';
    } else if (isLastDay) {
      goal = 'Final review and submission';
    } else {
      const progress = Math.round((i / workDays) * 100);
      goal = `Continue development - ${progress}% completion target`;
    }

    schedule.push({
      day: i + 1,
      date: dateStr,
      goal,
      hours: isBuffer ? Math.round(adjustedHours * 0.5 * 10) / 10 : adjustedHours,
      isToday: i === 0,
      warning,
      isBuffer,
      completed: false
    });
  }

  return schedule;
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

export function getDaysRemaining(deadline: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const deadlineDate = new Date(deadline);
  deadlineDate.setHours(0, 0, 0, 0);
  return Math.ceil((deadlineDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

export function isValidDeadline(deadline: string): boolean {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const deadlineDate = new Date(deadline);
  return deadlineDate > today;
}

export async function reschedulePlan(
  originalTask: TaskInput,
  incompleteDays: ScheduleItem[]
): Promise<ScheduleItem[]> {
  if (!apiKey) {
    console.warn('No Gemini API key found, using mock data');
    return generateMockReschedulePlan(originalTask, incompleteDays);
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

  const today = new Date();
  const todayStr = today.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric'
  });

  const incompleteGoals = incompleteDays.map(d => d.goal).join(', ');
  const daysRemaining = Math.max(getDaysRemaining(originalTask.deadline), 1);

  const prompt = `This is an emergency reschedule. The user has fallen behind on their task: ${originalTask.name}.
Description: ${originalTask.description || 'No additional description provided'}.
Deadline: ${originalTask.deadline}.
Days remaining: ${daysRemaining}.
Incomplete goals that need to be covered: ${incompleteGoals}.
I can work ${originalTask.hoursPerDay} hours per day.
Today is ${todayStr}.

Create a COMPRESSED, AGGRESSIVE plan to catch up. Be ruthless with prioritization. Combine incomplete work with remaining tasks. The user is behind schedule and needs an achievable but intensive plan.

Return ONLY a valid JSON array (no markdown, no code blocks). Each object must have exactly these fields:
{
  "day": number,
  "date": "Day Mon DD" format,
  "goal": "clear, actionable objective",
  "hours": number,
  "isToday": boolean,
  "warning": boolean,
  "isBuffer": boolean
}

JSON array only, no other text:`;

  try {
    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();

    let cleanedText = text.trim();
    if (cleanedText.startsWith('```json')) {
      cleanedText = cleanedText.slice(7);
    } else if (cleanedText.startsWith('```')) {
      cleanedText = cleanedText.slice(3);
    }
    if (cleanedText.endsWith('```')) {
      cleanedText = cleanedText.slice(0, -3);
    }
    cleanedText = cleanedText.trim();

    const schedule: ScheduleItem[] = JSON.parse(cleanedText);
    return schedule.map(item => ({ ...item, completed: false }));
  } catch (error) {
    console.error('Gemini API error:', error);
    return generateMockReschedulePlan(originalTask, incompleteDays);
  }
}

function generateMockReschedulePlan(
  originalTask: TaskInput,
  incompleteDays: ScheduleItem[]
): ScheduleItem[] {
  const today = new Date();
  const deadline = new Date(originalTask.deadline);
  const daysRemaining = Math.max(
    Math.ceil((deadline.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)),
    1
  );

  const hoursPerDay = Math.min(originalTask.hoursPerDay * 1.5, 12);
  const schedule: ScheduleItem[] = [];

  for (let i = 0; i < daysRemaining; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() + i);

    const dateStr = date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });

    const isLastDay = i === daysRemaining - 1;

    let goal: string;
    if (i === 0 && incompleteDays.length > 0) {
      goal = `Catch up: ${incompleteDays.slice(0, 2).map(d => d.goal.substring(0, 30)).join(' + ')}`;
    } else if (isLastDay) {
      goal = 'Final review and submission';
    } else {
      const incompleteGoal = incompleteDays[i]?.goal || 'Continue work on remaining tasks';
      goal = `${incompleteGoal.substring(0, 50)}`;
    }

    schedule.push({
      day: i + 1,
      date: dateStr,
      goal,
      hours: Math.round(hoursPerDay * 10) / 10,
      isToday: i === 0,
      warning: true,
      isBuffer: false,
      completed: false
    });
  }

  return schedule;
}
