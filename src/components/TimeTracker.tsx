import React, { useState, useEffect } from 'react';
import { Clock, Play, Square } from 'lucide-react';
import { format } from 'date-fns';
import { MockTimeEntryFactory } from '../patterns/implementations';
import { StartTimeEntryCommand } from '../patterns/implementations';
import { useAuth } from '../hooks/useAuth';
import { useLanguage } from '../contexts/LanguageContext';
import { mockDb } from '../lib/mockData';

export const TimeTracker: React.FC = () => {
  const [isTracking, setIsTracking] = useState(false);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [elapsedTime, setElapsedTime] = useState<string>('00:00:00');
  const { user } = useAuth();
  const { t } = useLanguage();

  const factory = new MockTimeEntryFactory();

  useEffect(() => {
    if (user) {
      const entries = mockDb.getTimeEntriesByUserId(user.id);
      const activeEntry = entries.find(entry => !entry.endTime);
      if (activeEntry) {
        setIsTracking(true);
        setStartTime(new Date(activeEntry.startTime));
      }
    }
  }, [user]);

  useEffect(() => {
    let interval: number;
    if (isTracking && startTime) {
      interval = window.setInterval(() => {
        const now = new Date();
        const diff = now.getTime() - startTime.getTime();
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        setElapsedTime(
          `${hours.toString().padStart(2, '0')}:${minutes
            .toString()
            .padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
        );
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTracking, startTime]);

  const handleStartTracking = async () => {
    const now = new Date();
    setStartTime(now);
    setIsTracking(true);

    const timeEntry = factory.createRegularTimeEntry(user!.id, now);
    const command = new StartTimeEntryCommand(timeEntry);
    await command.execute();
  };

  const handleStopTracking = async () => {
    if (user) {
      const entries = mockDb.getTimeEntriesByUserId(user.id);
      const activeEntry = entries.find(entry => !entry.endTime);
      if (activeEntry) {
        mockDb.updateTimeEntry(activeEntry.id, { endTime: new Date() });
      }
    }
    setIsTracking(false);
    setStartTime(null);
    setElapsedTime('00:00:00');
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 max-w-md mx-auto">
      <div className="text-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          {t('welcome')}, {user?.firstName}!
        </h1>
        <div className="flex items-center justify-center">
          <h2 className="text-2xl font-bold text-gray-800">{t('timeTracker')}</h2>
          <Clock className="w-6 h-6 text-blue-500 ml-2" />
        </div>
      </div>

      <div className="text-center mb-8">
        <div className="text-4xl font-mono font-bold text-gray-700">{elapsedTime}</div>
        <div className="text-sm text-gray-500 mt-2">
          {startTime && `${t('startedAt')} ${format(startTime, 'HH:mm:ss')}`}
        </div>
      </div>

      <div className="flex justify-center space-x-4">
        {!isTracking ? (
          <button
            onClick={handleStartTracking}
            className="flex items-center px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
          >
            <Play className="w-5 h-5 mr-2" />
            {t('startWorking')}
          </button>
        ) : (
          <button
            onClick={handleStopTracking}
            className="flex items-center px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
          >
            <Square className="w-5 h-5 mr-2" />
            {t('stopWorking')}
          </button>
        )}
      </div>
    </div>
  );
};