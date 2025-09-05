import { useState, useEffect } from 'react';
import { Plus, Edit3, MapPin, Building2, Users, CheckCircle, XCircle } from 'lucide-react';
import { useLanguage } from '@/react-app/contexts/LanguageContext';
import { ProjectType } from '@/shared/types';
import { collection, addDoc, getDocs, query, where, orderBy, doc, updateDoc, DocumentData } from 'firebase/firestore';
import { db } from '@/shared/services/firebase';

// Helper function to convert Firestore data to our type
const convertDoc = <T extends DocumentData>(doc: any): T => {
  return { ...doc.data(), id: doc.id } as T;
};

export default function Projects() {
  const { t } = useLanguage();
  const [showForm, setShowForm] = useState(false);
  const [editingProject, setEditingProject] = useState<ProjectType | null>(null);
  const [projects, setProjects] = useState<ProjectType[]>([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<{
    name: string;
    location: string;
    status: 'active' | 'inactive' | 'completed';
  }>({
    name: '',
    location: '',
    status: 'active',
  });

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const projectsRef = collection(db, 'projects');
      const q = query(
        projectsRef,
        where('is_active', '!=', false),
        orderBy('created_at', 'desc')
      );
      const querySnapshot = await getDocs(q);
      const projectsList = querySnapshot.docs.map(doc => convertDoc<ProjectType>(doc));
      setProjects(projectsList);
    } catch (error) {
      console.error('Failed to fetch projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (projectData: Omit<ProjectType, 'id'>) => {
    try {
      if (editingProject) {
        const docRef = doc(db, 'projects', editingProject.id);
        await updateDoc(docRef, {
          ...projectData,
          updated_at: new Date().toISOString()
        });
      } else {
        await addDoc(collection(db, 'projects'), {
          ...projectData,
          created_at: new Date().toISOString(),
          is_active: true
        });
      }
      await fetchProjects();
      setShowForm(false);
      setEditingProject(null);
    } catch (error) {
      console.error('Failed to save project:', error);
      alert(t('Failed to save project'));
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleEdit = (project: ProjectType) => {
    setEditingProject(project);
    setFormData({
      name: project.name,
      location: project.location || '',
      status: project.status || 'active',
    });
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const projectData = {
      name: formData.name,
      location: formData.location,
      status: formData.status,
      is_active: true,
      created_at: new Date().toISOString(),
    };
    await handleSave(projectData);
  };

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">{t('Projects')}</h1>
        <button
          onClick={() => {
            setEditingProject(null);
            setFormData({ name: '', location: '', status: 'active' });
            setShowForm(true);
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          {t('Add Project')}
        </button>
      </div>

      {loading ? (
        <div className="text-center">{t('Loading...')}</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((project) => (
            <div
              key={project.id}
              className="bg-white rounded-lg shadow-md p-4 border border-gray-200"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <Building2 className="w-5 h-5 text-gray-600" />
                    {project.name}
                  </h3>
                  {project.location && (
                    <p className="text-gray-600 flex items-center gap-1 mt-1">
                      <MapPin className="w-4 h-4" />
                      {project.location}
                    </p>
                  )}
                </div>
                <button
                  onClick={() => handleEdit(project)}
                  className="p-2 text-gray-400 hover:text-orange-600 transition-colors"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
              </div>

              <div className="flex justify-between items-center mt-4">
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-gray-600" />
                  <span className="text-sm text-gray-600">
                    {t('Workers')}: 0
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  {project.status === 'completed' ? (
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  ) : project.status === 'inactive' ? (
                    <XCircle className="w-5 h-5 text-red-600" />
                  ) : null}
                  <span
                    className={`text-sm ${
                      project.status === 'completed'
                        ? 'text-green-600'
                        : project.status === 'inactive'
                        ? 'text-red-600'
                        : 'text-blue-600'
                    }`}
                  >
                    {t(project.status)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">
              {editingProject ? t('Edit Project') : t('Add Project')}
            </h2>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2" htmlFor="name">
                  {t('Name')}
                </label>
                <input
                  type="text"
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2" htmlFor="location">
                  {t('Location')}
                </label>
                <input
                  type="text"
                  id="location"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2" htmlFor="status">
                  {t('Status')}
                </label>
                <select
                  id="status"
                  value={formData.status}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      status: e.target.value as 'active' | 'inactive' | 'completed',
                    })
                  }
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="active">{t('Active')}</option>
                  <option value="inactive">{t('Inactive')}</option>
                  <option value="completed">{t('Completed')}</option>
                </select>
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  {t('Cancel')}
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {t('Save')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
