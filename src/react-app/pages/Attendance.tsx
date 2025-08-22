import { useState, useEffect } from 'react';
import { Calendar, Check, X, Clock, Users, MapPin } from 'lucide-react';
import { useLanguage } from '@/react-app/contexts/LanguageContext';
import { useApi, api } from '@/react-app/hooks/useApi';
import { AttendanceType, WorkerType, ProjectType } from '@/shared/types';
import LocationButton from '@/react-app/components/LocationButton';
import { LocationData } from '@/react-app/utils/location';

export default function Attendance() {
  const { t } = useLanguage();
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedProject, setSelectedProject] = useState<string>('');
  const [currentLocation, setCurrentLocation] = useState<LocationData | null>(null);
  
  const { data: attendance, loading, execute: fetchAttendance } = useApi<AttendanceType[]>();
  const { data: workers, execute: fetchWorkers } = useApi<WorkerType[]>();
  const { data: projects, execute: fetchProjects } = useApi<ProjectType[]>();
  const { execute: markAttendance } = useApi<AttendanceType>();

  useEffect(() => {
    fetchAttendance(() => 
      api.get<AttendanceType[]>(`/api/attendance?date=${selectedDate}${selectedProject ? `&project_id=${selectedProject}` : ''}`)
    );
    fetchWorkers(() => api.get<WorkerType[]>('/api/workers'));
    fetchProjects(() => api.get<ProjectType[]>('/api/projects'));
  }, [selectedDate, selectedProject, fetchAttendance, fetchWorkers, fetchProjects]);

  const handleMarkAttendance = async (workerId: number, projectId: number, status: 'full' | 'half' | 'absent') => {
    try {
      const attendanceData = {
        worker_id: workerId,
        project_id: projectId,
        attendance_date: selectedDate,
        status,
        latitude: currentLocation?.latitude,
        longitude: currentLocation?.longitude,
        location_name: currentLocation?.locationName,
      };

      await markAttendance(() => 
        api.post<AttendanceType>('/api/attendance', attendanceData)
      );
      
      // Refresh attendance
      fetchAttendance(() => 
        api.get<AttendanceType[]>(`/api/attendance?date=${selectedDate}${selectedProject ? `&project_id=${selectedProject}` : ''}`)
      );
    } catch (error) {
      console.error('Error marking attendance:', error);
    }
  };

  const getWorkerAttendance = (workerId: number) => {
    return attendance?.find(a => a.worker_id === workerId);
  };

  const getAttendanceStats = () => {
    if (!attendance) return { present: 0, half: 0, absent: 0 };
    
    return attendance.reduce((acc, record) => {
      if (record.status === 'full') acc.present++;
      else if (record.status === 'half') acc.half++;
      else acc.absent++;
      return acc;
    }, { present: 0, half: 0, absent: 0 });
  };

  const stats = getAttendanceStats();
  const filteredWorkers = selectedProject 
    ? workers?.filter(w => w.project_id === parseInt(selectedProject))
    : workers?.filter(w => w.is_active);

  if (loading && !attendance) {
    return (
      <div className="p-4 pb-20">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded-lg w-48"></div>
          <div className="h-12 bg-gray-200 rounded-lg"></div>
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-24 bg-gray-200 rounded-xl"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 pb-20">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">{t('attendance.title')}</h1>
        <div className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-gray-500" />
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="p-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Project Filter */}
      {projects && projects.length > 0 && (
        <div className="mb-4">
          <select
            value={selectedProject}
            onChange={(e) => setSelectedProject(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          >
            <option value="">All Projects</option>
            {projects.map(project => (
              <option key={project.id} value={project.id}>{project.name}</option>
            ))}
          </select>
        </div>
      )}

      {/* Location Capture */}
      <div className="mb-4 bg-white rounded-xl p-4 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-blue-500" />
            <span className="text-sm font-medium text-gray-700">
              {currentLocation ? 'Location Captured' : 'Capture Location'}
            </span>
          </div>
          <LocationButton 
            onLocationCapture={setCurrentLocation}
            className="flex-shrink-0"
          />
        </div>
        {currentLocation && (
          <div className="mt-2 text-xs text-gray-600">
            📍 {currentLocation.locationName}
          </div>
        )}
      </div>

      {/* Attendance Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-green-50 rounded-xl p-4 border border-green-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-600">Present</p>
              <p className="text-2xl font-bold text-green-700">{stats.present}</p>
            </div>
            <Check className="w-8 h-8 text-green-500" />
          </div>
        </div>

        <div className="bg-orange-50 rounded-xl p-4 border border-orange-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-orange-600">Half Day</p>
              <p className="text-2xl font-bold text-orange-700">{stats.half}</p>
            </div>
            <Clock className="w-8 h-8 text-orange-500" />
          </div>
        </div>

        <div className="bg-red-50 rounded-xl p-4 border border-red-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-red-600">Absent</p>
              <p className="text-2xl font-bold text-red-700">{stats.absent}</p>
            </div>
            <X className="w-8 h-8 text-red-500" />
          </div>
        </div>
      </div>

      {/* Workers List */}
      <div className="space-y-4">
        {filteredWorkers && filteredWorkers.length > 0 ? (
          filteredWorkers.map((worker) => {
            const workerAttendance = getWorkerAttendance(worker.id);
            
            return (
              <div key={worker.id} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center">
                      <Users className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{worker.name}</h3>
                      <p className="text-sm text-gray-600">{worker.labour_type}</p>
                    </div>
                  </div>
                  
                  {workerAttendance && (
                    <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                      workerAttendance.status === 'full' 
                        ? 'bg-green-100 text-green-800' 
                        : workerAttendance.status === 'half'
                        ? 'bg-orange-100 text-orange-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {workerAttendance.status === 'full' ? 'Present' : 
                       workerAttendance.status === 'half' ? 'Half Day' : 'Absent'}
                    </div>
                  )}
                </div>

                {/* Attendance Buttons */}
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => handleMarkAttendance(worker.id, worker.project_id || 1, 'full')}
                    className={`p-3 rounded-lg font-medium text-sm transition-colors ${
                      workerAttendance?.status === 'full'
                        ? 'bg-green-500 text-white'
                        : 'bg-green-50 text-green-700 hover:bg-green-100'
                    }`}
                  >
                    <Check className="w-4 h-4 mx-auto mb-1" />
                    Full Day
                  </button>
                  
                  <button
                    onClick={() => handleMarkAttendance(worker.id, worker.project_id || 1, 'half')}
                    className={`p-3 rounded-lg font-medium text-sm transition-colors ${
                      workerAttendance?.status === 'half'
                        ? 'bg-orange-500 text-white'
                        : 'bg-orange-50 text-orange-700 hover:bg-orange-100'
                    }`}
                  >
                    <Clock className="w-4 h-4 mx-auto mb-1" />
                    Half Day
                  </button>
                  
                  <button
                    onClick={() => handleMarkAttendance(worker.id, worker.project_id || 1, 'absent')}
                    className={`p-3 rounded-lg font-medium text-sm transition-colors ${
                      workerAttendance?.status === 'absent'
                        ? 'bg-red-500 text-white'
                        : 'bg-red-50 text-red-700 hover:bg-red-100'
                    }`}
                  >
                    <X className="w-4 h-4 mx-auto mb-1" />
                    Absent
                  </button>
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center py-12">
            <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">{t('attendance.noAttendance')}</p>
          </div>
        )}
      </div>
    </div>
  );
}
