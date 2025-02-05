import React, { useState, useEffect } from 'react';
import { Calendar, Users, DollarSign, Clock, CalendarDays, UserCheck } from 'lucide-react';
import { mockDb } from '../lib/mockData';
import { format, startOfDay, endOfDay, addHours, isWithinInterval, parseISO, differenceInHours, isSameDay, startOfMonth, endOfMonth } from 'date-fns';
import { ITimeEntry, IUser } from '../patterns/interfaces';
import { useLanguage } from '../contexts/LanguageContext';

export const AdminDashboard: React.FC = () => {
  const [employees, setEmployees] = useState<IUser[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState<string | null>(null);
  const [timeEntries, setTimeEntries] = useState<ITimeEntry[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [workSchedule, setWorkSchedule] = useState({
    startHour: '09:00',
    endHour: '17:00'
  });
  const [payRates, setPayRates] = useState({
    regular: 20,
    overtime: 30
  });
  const [totalPayroll, setTotalPayroll] = useState(0);
  const [dailyPayroll, setDailyPayroll] = useState(0);
  const [totalHoursWorked, setTotalHoursWorked] = useState(0);
  const [employeeWorkDays, setEmployeeWorkDays] = useState<Date[]>([]);
  const [employeesForDate, setEmployeesForDate] = useState<Array<{ employee: IUser; hours: number }>>([]);
  const { t } = useLanguage();

  useEffect(() => {
    const users = mockDb.getUsers().filter(user => user.role === 'employee');
    setEmployees(users);

    const allEntries = mockDb.getTimeEntries();
    const totalHours = allEntries.reduce((acc, entry) => {
      if (entry.endTime) {
        return acc + differenceInHours(new Date(entry.endTime), new Date(entry.startTime));
      }
      return acc;
    }, 0);
    setTotalHoursWorked(totalHours);
  }, []);

  useEffect(() => {
    if (selectedEmployee) {
      const entries = mockDb.getTimeEntriesByUserId(selectedEmployee);
      setTimeEntries(entries);

      const workDays = entries.reduce((acc: Date[], entry) => {
        const startDate = startOfDay(new Date(entry.startTime));
        if (!acc.some(date => isSameDay(date, startDate))) {
          acc.push(startDate);
        }
        return acc;
      }, []);
      setEmployeeWorkDays(workDays);

      // Calculate nomina mensual
      const monthStart = startOfMonth(selectedDate);
      const monthEnd = endOfMonth(selectedDate);
      let monthlyTotal = 0;

      entries.forEach(entry => {
        if (!entry.endTime) return;
        const entryDate = new Date(entry.startTime);
        if (entryDate >= monthStart && entryDate <= monthEnd) {
          const { regularHours, overtimeHours } = calculateHours(entry);
          monthlyTotal += (regularHours * payRates.regular) + (overtimeHours * payRates.overtime);
        }
      });

      setTotalPayroll(monthlyTotal);
    }
  }, [selectedEmployee, selectedDate, workSchedule, payRates]);

  useEffect(() => {
    const allEntries = mockDb.getTimeEntries();
    const employeesWorked = employees.reduce((acc: Array<{ employee: IUser; hours: number }>, employee) => {
      const employeeEntries = allEntries.filter(entry => 
        entry.userId === employee.id && 
        isSameDay(new Date(entry.startTime), selectedDate)
      );

      if (employeeEntries.length > 0) {
        const totalHours = employeeEntries.reduce((hours, entry) => {
          if (entry.endTime) {
            return hours + differenceInHours(new Date(entry.endTime), new Date(entry.startTime));
          }
          return hours;
        }, 0);

        acc.push({ employee, hours: totalHours });
      }
      return acc;
    }, []);

    setEmployeesForDate(employeesWorked);

    // Calculate paga del dia
    let dailyTotal = 0;
    allEntries.forEach(entry => {
      if (!entry.endTime) return;
      if (isSameDay(new Date(entry.startTime), selectedDate)) {
        const { regularHours, overtimeHours } = calculateHours(entry);
        console.log(entry.userId)
        console.log("Horas trabajadas"+regularHours)
        console.log("tasa de paga:"+payRates.regular)
        console.log("Horas extra:"+overtimeHours)
        dailyTotal += (regularHours * payRates.regular) + (overtimeHours * payRates.overtime);
      }
    });
    setDailyPayroll(dailyTotal);
  }, [selectedDate, employees, workSchedule, payRates]);

  const calculateHours = (entry: ITimeEntry) => {
    if (!entry.endTime) return { regularHours: 0, overtimeHours: 0 };

    const startTime = new Date(entry.startTime);
    const endTime = new Date(entry.endTime);
    const [startHour] = workSchedule.startHour.split(':').map(Number);
    const [endHour] = workSchedule.endHour.split(':').map(Number);
    const totalHours = differenceInHours(endTime, startTime);
    
    const entryStartHour = startTime.getHours();
    let regularHours = 0;
    let overtimeHours = 0;

    if (entryStartHour >= startHour && entryStartHour < endHour) {
      regularHours = Math.min(totalHours, endHour - entryStartHour);
      overtimeHours = Math.max(0, totalHours - regularHours);
    } else {
      overtimeHours = totalHours;
    }

    return { regularHours, overtimeHours };
  };

  const timeSlots = Array.from({ length: 24 }, (_, i) => {
    const date = addHours(startOfDay(selectedDate), i);
    return format(date, 'HH:mm');
  });

  const isTimeEntryActive = (hour: number) => {
    if (!selectedEmployee) return false;
    
    const slotStart = addHours(startOfDay(selectedDate), hour);
    const slotEnd = addHours(slotStart, 1);
    
    return timeEntries.some(entry => {
      const entryStart = new Date(entry.startTime);
      const entryEnd = entry.endTime ? new Date(entry.endTime) : new Date();
      
      if (!isSameDay(entryStart, selectedDate)) return false;

      return isWithinInterval(slotStart, { start: entryStart, end: entryEnd }) ||
             isWithinInterval(slotEnd, { start: entryStart, end: entryEnd }) ||
             (slotStart <= entryStart && slotEnd >= entryEnd);
    });
  };

  const isWithinWorkHours = (hour: number) => {
    const [startHour] = workSchedule.startHour.split(':').map(Number);
    const [endHour] = workSchedule.endHour.split(':').map(Number);
    return hour >= startHour && hour < endHour;
  };

  const getTimeBlockColor = (hour: number) => {
    const isActive = isTimeEntryActive(hour);
    const isWorkHour = isWithinWorkHours(hour);

    if (isWorkHour) {
      return isActive ? 'bg-green-500' : 'bg-red-500';
    }
    return isActive ? 'bg-orange-500' : 'bg-gray-200';
  };

  const handleDateChange = (dateString: string) => {
    const date = new Date(dateString);
    date.setMinutes(date.getMinutes() + date.getTimezoneOffset());
    setSelectedDate(date);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">{t('totalEmployees')}</h3>
            <Users className="w-6 h-6 text-blue-500" />
          </div>
          <p className="text-3xl font-bold text-gray-900">{employees.length}</p>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">{t('totalHoursWorked')}</h3>
            <Clock className="w-6 h-6 text-purple-500" />
          </div>
          <p className="text-3xl font-bold text-gray-900">{totalHoursWorked}</p>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">{t('monthlyPayroll')}</h3>
            <DollarSign className="w-6 h-6 text-yellow-500" />
          </div>
          <p className="text-3xl font-bold text-gray-900">
            ${totalPayroll.toFixed(2)}
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">{t('dailyPayroll')}</h3>
            <DollarSign className="w-6 h-6 text-green-500" />
          </div>
          <p className="text-3xl font-bold text-gray-900">
            ${dailyPayroll.toFixed(2)}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-800">{t('employeeWorkDays')}</h2>
            <CalendarDays className="w-6 h-6 text-indigo-500" />
          </div>
          <div className="mb-4">
            <select
              className="w-full p-2 border rounded-lg"
              value={selectedEmployee || ''}
              onChange={(e) => setSelectedEmployee(e.target.value)}
            >
              <option value="">{t('selectEmployee')}</option>
              {employees.map((employee) => (
                <option key={employee.id} value={employee.id}>
                  {employee.firstName} {employee.lastName}
                </option>
              ))}
            </select>
          </div>
          {selectedEmployee && (
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {employeeWorkDays.map((day, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="font-medium">{format(day, 'PPP')}</span>
                  <span className="text-sm text-gray-600">
                    {timeEntries
                      .filter(entry => isSameDay(new Date(entry.startTime), day))
                      .reduce((acc, entry) => {
                        if (entry.endTime) {
                          return acc + differenceInHours(new Date(entry.endTime), new Date(entry.startTime));
                        }
                        return acc;
                      }, 0)} {t('hours')}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-800">{t('employeeWorkDays')}</h2>
            <UserCheck className="w-6 h-6 text-teal-500" />
          </div>
          <div className="mb-4">
            <input
              type="date"
              value={format(selectedDate, 'yyyy-MM-dd')}
              onChange={(e) => handleDateChange(e.target.value)}
              className="w-full p-2 border rounded-lg"
            />
          </div>
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {employeesForDate.map(({ employee, hours }) => (
              <div key={employee.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="font-medium">
                  {employee.firstName} {employee.lastName}
                </span>
                <span className="text-sm text-gray-600">{hours} {t('hours')}</span>
              </div>
            ))}
            {employeesForDate.length === 0 && (
              <p className="text-center text-gray-500">{t('noEmployeesWorked')}</p>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
        <h2 className="text-xl font-bold text-gray-800 mb-6">{t('workSchedule')}</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-semibold mb-4">{t('workSchedule')}</h3>
            <div className="flex space-x-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('startTime')}</label>
                <input
                  type="time"
                  value={workSchedule.startHour}
                  onChange={(e) => setWorkSchedule(prev => ({ ...prev, startHour: e.target.value }))}
                  className="px-3 py-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('endTime')}</label>
                <input
                  type="time"
                  value={workSchedule.endHour}
                  onChange={(e) => setWorkSchedule(prev => ({ ...prev, endHour: e.target.value }))}
                  className="px-3 py-2 border rounded-lg"
                />
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">{t('payRates')}</h3>
            <div className="flex space-x-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('regularRate')}</label>
                <input
                  type="number"
                  value={payRates.regular}
                  onChange={(e) => setPayRates(prev => ({ ...prev, regular: Number(e.target.value) }))}
                  className="px-3 py-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('overtimeRate')}</label>
                <input
                  type="number"
                  value={payRates.overtime}
                  onChange={(e) => setPayRates(prev => ({ ...prev, overtime: Number(e.target.value) }))}
                  className="px-3 py-2 border rounded-lg"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">{t('timeEntriesTimeline')}</h2>
            <p className="text-gray-600 mt-1">
              {t('showingEntriesFor')} {format(selectedDate, 'PPPP')}
            </p>
          </div>
        </div>

        {selectedEmployee && (
          <div className="overflow-x-auto">
            <div className="min-w-full">
              <div className="flex border-b">
                <div className="w-32 flex-shrink-0"></div>
                {timeSlots.map((time, index) => (
                  <div
                    key={index}
                    className="flex-1 text-center text-sm text-gray-600 py-2"
                  >
                    {time}
                  </div>
                ))}
              </div>

              <div className="relative">
                <div className="flex">
                  <div className="w-32 flex-shrink-0 py-4 font-medium text-gray-900">
                    Time Blocks
                  </div>
                  <div className="flex-grow grid grid-cols-24 gap-0">
                    {Array.from({ length: 24 }, (_, hour) => (
                      <div
                        key={hour}
                        className={`h-12 border-r ${getTimeBlockColor(hour)}`}
                      />
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-4 flex items-center space-x-4 text-sm">
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-green-500 rounded mr-2"></div>
                  <span>Registered (Work Hours)</span>
                </div>
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-red-500 rounded mr-2"></div>
                  <span>Unregistered (Work Hours)</span>
                </div>
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-orange-500 rounded mr-2"></div>
                  <span>Registered (Outside Hours)</span>
                </div>
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-gray-200 rounded mr-2"></div>
                  <span>Unregistered (Outside Hours)</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};