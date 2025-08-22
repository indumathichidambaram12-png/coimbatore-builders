import React, { useState, useEffect } from 'react';
import { Plus, Edit3, Phone, MapPin, User } from 'lucide-react';
import { useLanguage } from '@/react-app/contexts/LanguageContext';
import { WorkerType, ProjectType, LABOUR_TYPES } from '@/shared/types';
import PhotoUpload from '@/react-app/components/PhotoUpload';
import { useDatabase } from '@/shared/contexts/DatabaseContext';

export default function Workers() {
  const { t } = useLanguage();
  const { db } = useDatabase();
  const [showForm, setShowForm] = useState(false);
  const [editingWorker, setEditingWorker] = useState<WorkerType | null>(null);
  const [selectedProject, setSelectedProject] = useState<string>('');
  const [workers, setWorkers] = useState<WorkerType[]>([]);
  const [projects, setProjects] = useState<ProjectType[]>([]);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    labour_type: '',
    phone_number: '',
    aadhaar_id: '',
    daily_wage: '',
    hourly_rate: '',
    upi_id: '',
    project_id: '',
    photo_url: '',
  });
  const [selectedPhoto, setSelectedPhoto] = useState<File | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [workersData, projectsData] = await Promise.all([
          db.getWorkers(),
          db.getProjects()
        ]);
        setWorkers(workersData);
        setProjects(projectsData);
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [db]);

  // To be implemented when photo upload is needed
  const _uploadPhoto = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('photo', file);
    
    const response = await fetch('/api/upload/photo', {
      method: 'POST',
      body: formData,
    });
    
    if (!response.ok) {
      throw new Error('Photo upload failed');
    }
    
    const result = await response.json();
    return result.photo_url;
  };

    const handleCloseForm = () => {
    setShowForm(false);
    setEditingWorker(null);
    setFormData({
      name: '',
      labour_type: '',
      phone_number: '',
      aadhaar_id: '',
      daily_wage: '',
      hourly_rate: '',
      upi_id: '',
      project_id: '',
      photo_url: '',
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { name, labour_type, phone_number, daily_wage, hourly_rate, project_id } = formData;
    
    if (!name || !labour_type || !phone_number) {
      alert(t('Please fill in all required fields'));
      return;
    }

    const workerData = {
      ...formData,
      daily_wage: Number(daily_wage) || 0,
      hourly_rate: Number(hourly_rate) || 0,
      projects: project_id ? [project_id] : [],
      lastUpdated: new Date().toISOString()
    };

    try {
      if (editingWorker) {
        await db.updateWorkerById(editingWorker.id, workerData);
      } else {
        await db.createWorker(workerData);
      }
      handleCloseForm();
      const updatedWorkers = await db.getWorkers();
      setWorkers(updatedWorkers);
    } catch (error) {
      console.error('Error saving worker:', error);
      alert(t('Error saving worker'));
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      labour_type: '',
      phone_number: '',
      aadhaar_id: '',
      daily_wage: '',
      hourly_rate: '',
      upi_id: '',
      project_id: '',
      photo_url: '',
    });
    setSelectedPhoto(null);
  };

  const handleEdit = (worker: WorkerType) => {
    setEditingWorker(worker);
    setFormData({
      name: worker.name,
      labour_type: worker.labour_type,
      phone_number: worker.phone_number || '',
      aadhaar_id: worker.aadhaar_id || '',
      daily_wage: worker.daily_wage.toString(),
      hourly_rate: worker.hourly_rate?.toString() || '',
      upi_id: worker.upi_id || '',
      project_id: worker.project_id?.toString() || '',
      photo_url: worker.photo_url || '',
    });
    setSelectedPhoto(null);
    setShowForm(true);
  };

  const filteredWorkers = selectedProject 
    ? workers?.filter(w => w.project_id === parseInt(selectedProject))
    : workers;

  if (loading && !workers) {
    return (
      <div className="p-4 pb-20">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded-lg w-32"></div>
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-24 bg-gray-200 rounded-xl"></div>
          ))}
        </div>
      </div>
    );
  }

  if (showForm) {
    return (
      <div className="p-4 pb-20">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">
              {editingWorker ? t('workers.editWorker') : t('workers.addWorker')}
            </h2>
            <button
              onClick={() => {
                setShowForm(false);
                setEditingWorker(null);
                resetForm();
              }}
              className="text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Photo Upload */}
            <PhotoUpload
              currentPhoto={formData.photo_url}
              onPhotoChange={setSelectedPhoto}
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('workers.name')} *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('workers.labourType')} *
              </label>
              <select
                value={formData.labour_type}
                onChange={(e) => setFormData({ ...formData, labour_type: e.target.value })}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                required
              >
                <option value="">Select Labour Type</option>
                {LABOUR_TYPES.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('workers.phone')} {t('common.optional')}
                </label>
                <input
                  type="tel"
                  value={formData.phone_number}
                  onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('workers.aadhaar')} {t('common.optional')}
                </label>
                <input
                  type="text"
                  value={formData.aadhaar_id}
                  onChange={(e) => setFormData({ ...formData, aadhaar_id: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('workers.dailyWage')} * (₹)
                </label>
                <input
                  type="number"
                  value={formData.daily_wage}
                  onChange={(e) => setFormData({ ...formData, daily_wage: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('workers.hourlyRate')} {t('common.optional')} (₹)
                </label>
                <input
                  type="number"
                  value={formData.hourly_rate}
                  onChange={(e) => setFormData({ ...formData, hourly_rate: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('workers.upiId')} {t('common.optional')}
              </label>
              <input
                type="text"
                value={formData.upi_id}
                onChange={(e) => setFormData({ ...formData, upi_id: e.target.value })}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('workers.project')} {t('common.optional')}
              </label>
              <select
                value={formData.project_id}
                onChange={(e) => setFormData({ ...formData, project_id: e.target.value })}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              >
                <option value="">No Project Assigned</option>
                {projects?.map(project => (
                  <option key={project.id} value={project.id}>{project.name}</option>
                ))}
              </select>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                className="flex-1 bg-gradient-to-r from-orange-500 to-amber-500 text-white py-3 px-6 rounded-lg font-medium hover:shadow-lg transition-shadow"
              >
                {t('common.save')}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setEditingWorker(null);
                  resetForm();
                }}
                className="flex-1 bg-gray-100 text-gray-700 py-3 px-6 rounded-lg font-medium hover:bg-gray-200 transition-colors"
              >
                {t('common.cancel')}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 pb-20">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">{t('workers.title')}</h1>
        <button
          onClick={() => setShowForm(true)}
          className="bg-gradient-to-r from-orange-500 to-amber-500 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 shadow-lg hover:shadow-xl transition-shadow"
        >
          <Plus className="w-4 h-4" />
          {t('common.add')}
        </button>
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

      {/* Workers List */}
      <div className="space-y-4">
        {filteredWorkers && filteredWorkers.length > 0 ? (
          filteredWorkers.map((worker) => (
            <div key={worker.id} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-amber-500 rounded-full flex items-center justify-center">
                    <User className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{worker.name}</h3>
                    <p className="text-sm text-gray-600">{worker.labour_type}</p>
                    <p className="text-sm font-medium text-orange-600">₹{worker.daily_wage}/day</p>
                  </div>
                </div>
                <button
                  onClick={() => handleEdit(worker)}
                  className="p-2 text-gray-400 hover:text-orange-600 transition-colors"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
              </div>

              {(worker.phone_number || worker.project_name) && (
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <div className="flex items-center justify-between text-sm text-gray-600">
                    {worker.phone_number && (
                      <div className="flex items-center gap-1">
                        <Phone className="w-4 h-4" />
                        <span>{worker.phone_number}</span>
                      </div>
                    )}
                    {worker.project_name && (
                      <div className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        <span>{worker.project_name}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="text-center py-12">
            <User className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">{t('workers.noWorkers')}</p>
          </div>
        )}
      </div>
    </div>
  );
}
