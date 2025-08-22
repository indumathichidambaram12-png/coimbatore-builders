import { useState, useEffect } from 'react';
import { Plus, Edit3, MapPin, Building2, Users, CheckCircle, XCircle } from 'lucide-react';
import { useLanguage } from '@/react-app/contexts/LanguageContext';
import { useApi, api } from '@/react-app/hooks/useApi';
import { ProjectType } from '@/shared/types';
import { useDatabase } from '@/shared/contexts/DatabaseContext';

export default function Projects() {
  const { t } = useLanguage();
  const { db } = useDatabase();
  const [showForm, setShowForm] = useState(false);
  const [editingProject, setEditingProject] = useState<ProjectType | null>(null);
  const [projects, setProjects] = useState<ProjectType[]>([]);
  const [loading, setLoading] = useState(false);
  const { execute: saveToApi } = useApi<ProjectType>();

  const [formData, setFormData] = useState<{
    name: string;
    location: string;
    status: 'active' | 'inactive' | 'completed';
  }>({
    name: '',
    location: '',
    status: 'active',
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        // Try to fetch from API first
        try {
          const apiProjects = await api.get<ProjectType[]>('/api/projects');
          setProjects(apiProjects);
        } catch (error) {
          console.log('Could not fetch from API, using local data');
        }
        
        // Then get local data
        const localProjects = await db.getProjects();
        if (localProjects.length > 0) {
          setProjects(prev => {
            // Merge API and local data, preferring local data
            const merged = [...prev];
            localProjects.forEach(localProject => {
              const index = merged.findIndex(p => p.id === localProject.id);
              if (index >= 0) {
                merged[index] = localProject;
              } else {
                merged.push(localProject);
              }
            });
            return merged;
          });
        }
      } catch (error) {
        console.error('Error loading projects:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, [db]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) return;

    try {
      const projectData = {
        ...formData,
      };

      // Save to local database
      let savedProject;
      if (editingProject) {
        await db.run(
          'UPDATE projects SET name = ?, location = ?, status = ? WHERE id = ?',
          [projectData.name, projectData.location, projectData.status, editingProject.id]
        );
        savedProject = { ...projectData, id: editingProject.id };
      } else {
        const result = await db.addProject(projectData);
        savedProject = { ...projectData, id: result };
      }

      // Try to save to API
      try {
        if (editingProject) {
          await saveToApi(() => api.put<ProjectType>(`/api/projects/${editingProject.id}`, projectData));
        } else {
          await saveToApi(() => api.post<ProjectType>('/api/projects', projectData));
        }
      } catch (error) {
        console.log('Could not save to API, data saved locally');
      }

      setShowForm(false);
      setEditingProject(null);
      resetForm();
      
      // Refresh the projects list
      const updatedProjects = await db.getProjects();
      setProjects(updatedProjects);
    } catch (error) {
      console.error('Error saving project:', error);
      alert(t('Error saving project. Please try again.'));
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      location: '',
      status: 'active',
    });
  };

  const handleEdit = (project: ProjectType) => {
    setEditingProject(project);
    setFormData({
      name: project.name,
      location: project.location || '',
      status: project.status,
    });
    setShowForm(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'completed':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      case 'inactive':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-400';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-blue-500" />;
      case 'inactive':
        return <XCircle className="w-4 h-4 text-gray-500" />;
      default:
        return <XCircle className="w-4 h-4 text-gray-500" />;
    }
  };

  if (loading && !projects) {
    return (
      <div className="p-4 pb-20">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded-lg w-32"></div>
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-24 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
          ))}
        </div>
      </div>
    );
  }

  if (showForm) {
    return (
      <div className="p-4 pb-20">
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              {editingProject ? t('projects.editProject') : t('projects.addProject')}
            </h2>
            <button
              onClick={() => {
                setShowForm(false);
                setEditingProject(null);
                resetForm();
              }}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
            >
              ✕
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('projects.name')} *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('projects.location')} {t('common.optional')}
              </label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('projects.status')} *
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                required
              >
                <option value="active">{t('projects.active')}</option>
                <option value="inactive">{t('projects.inactive')}</option>
                <option value="completed">{t('projects.completed')}</option>
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
                  setEditingProject(null);
                  resetForm();
                }}
                className="flex-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 py-3 px-6 rounded-lg font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
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
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('projects.title')}</h1>
        <button
          onClick={() => setShowForm(true)}
          className="bg-gradient-to-r from-orange-500 to-amber-500 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 shadow-lg hover:shadow-xl transition-shadow"
        >
          <Plus className="w-4 h-4" />
          {t('common.add')}
        </button>
      </div>

      {/* Projects List */}
      <div className="space-y-4">
        {projects && projects.length > 0 ? (
          projects.map((project) => (
            <div key={project.id} className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center">
                    <Building2 className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">{project.name}</h3>
                    {project.location && (
                      <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
                        <MapPin className="w-4 h-4" />
                        <span>{project.location}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2 mt-2">
                      {getStatusIcon(project.status)}
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}>
                        {t(`projects.${project.status}`)}
                      </span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => handleEdit(project)}
                  className="p-2 text-gray-400 hover:text-orange-600 transition-colors"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
              </div>

              {/* Project Stats */}
              <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                    <Users className="w-4 h-4" />
                    <span>Workers: 0</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                    <Building2 className="w-4 h-4" />
                    <span>Status: {t(`projects.${project.status}`)}</span>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-12">
            <Building2 className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400">No projects found</p>
            <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">
              Add your first project to get started
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
