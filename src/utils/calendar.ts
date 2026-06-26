import type { ScheduleItem } from './planner';

export function generateICSFile(schedule: ScheduleItem[]): string {
  const lines: string[] = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Deadline Rescue//EN'
  ];

  schedule.forEach(item => {
    const dateStr = parseDateFromSchedule(item.date);
    lines.push(
      'BEGIN:VEVENT',
      `DTSTART;VALUE=DATE:${dateStr}`,
      `DTEND;VALUE=DATE:${dateStr}`,
      `SUMMARY:${escapeText(item.goal)}`,
      'DESCRIPTION:Deadline Rescue Plan',
      'END:VEVENT'
    );
  });

  lines.push('END:VCALENDAR');
  return lines.join('\r\n');
}

export function downloadICS(schedule: ScheduleItem[]): void {
  const icsContent = generateICSFile(schedule);
  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = 'deadline-rescue-schedule.ics';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function parseDateFromSchedule(dateStr: string): string {
  const parsed = new Date(dateStr);
  if (!isNaN(parsed.getTime())) {
    return parsed.toISOString().split('T')[0].replace(/-/g, '');
  }
  const today = new Date();
  return today.toISOString().split('T')[0].replace(/-/g, '');
}

function escapeText(text: string): string {
  return text.replace(/[;,\n\\]/g, char => {
    if (char === '\n') return '\\n';
    return '\\' + char;
  });
}
