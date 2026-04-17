// ProfilePage - User profile management
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom'
import { User, Mail, Calendar, Edit3, Save, X, Sparkles } from 'lucide-react';
import { Button } from '../../ui/button'
import { Input } from '../../ui/input'
import Loading from '../../ui/loading'
import apiClient from '../../shared/api/client';

const ProfilePage = () => {
  const [user, setUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    career: '',
    bio: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      console.log('Fetching user profile...');
      const response = await apiClient.get('/users/profile');

      const userData = response.data;
      console.log('User data received:', userData);

      if (userData.success && userData.data) {
        const user = userData.data;
        console.log('User object:', user);

        // Split full name into first and last name
        const nameParts = user.name ? user.name.split(' ') : ['', ''];
        const firstName = nameParts[0] || '';
        const lastName = nameParts.slice(1).join(' ') || '';

        const userWithSplitName = {
          ...user,
          firstName,
          lastName,
          fullName: user.name
        };

        console.log('Setting user data:', userWithSplitName);
        setUser(userWithSplitName);
        setFormData({
          firstName,
          lastName,
          email: user.email || '',
          career: user.carrer || '', // Note: using 'carrer' as per user's table
          bio: user.bio || ''
        });
      } else {
        console.error('Invalid user data structure:', userData);
      }

    } catch (error) {
      console.error('Error fetching user profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // Combine first and last name
      const fullName = `${formData.firstName} ${formData.lastName}`.trim();

      const updateData = {
        name: fullName,
        carrer: formData.career, // Note: using 'carrer' as per user's table
        bio: formData.bio
      };

      // Implement update profile API using apiClient
      console.log('Updating profile:', updateData);
      // Assuming we can update via PUT /users/profile or /users/:id.
      // Using SettingsPage logic reference: PUT /users/:id. But we need ID.
      // Or if there is a /users/profile PUT endpoint.
      // Let's assume we use the same endpoint structure as SettingsPage, which gets ID from session.
      // But here we have `user.id` from the fetched profile data.

      if (!user.id) throw new Error("User ID missing");

      await apiClient.put(`/users/${user.id}`, updateData);

      // For now, update local state
      setUser(prev => ({
        ...prev,
        firstName: formData.firstName,
        lastName: formData.lastName,
        name: fullName,
        phone: formData.phone,
        carrer: formData.career,
        bio: formData.bio
      }));
      setIsEditing(false);
      // alert('Perfil actualizado exitosamente');
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Error al actualizar el perfil');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      career: user.carrer || '',
      bio: user.bio || ''
    });
    setIsEditing(false);
  };

  if (loading) {
    return <Loading message="Cargando perfil..." />;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-primary text-white p-6 shadow-lg">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold">Mi Perfil</h1>
          <p className="text-white/90 mt-1">Gestiona tu información personal</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-card rounded-lg shadow-lg overflow-hidden border border-border">
          {/* Profile Header */}
          <div className="bg-gradient-to-r from-primary to-primary/80 p-8 text-white">
            <div className="flex items-center space-x-6">
              <div className="w-24 h-24 bg-card/20 rounded-full flex items-center justify-center">
                <User size={48} />
              </div>
              <div>
                <h2 className="text-3xl font-bold">{user.fullName}</h2>
                <p className="text-white/90 mt-1">{user.email}</p>
                <div className="flex items-center space-x-4 mt-3 text-sm">
                  <div className="flex items-center space-x-1">
                    <Calendar size={16} />
                    <span>Miembro desde {new Date(user.created_at).toLocaleDateString('es-ES')}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Profile Content */}
          <div className="p-8">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold text-foreground">Información Personal</h3>
              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="inline-flex items-center px-4 py-2 border border-border rounded-md shadow-sm text-sm font-medium text-foreground bg-card hover:bg-muted focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                >
                  <Edit3 className="h-4 w-4 mr-2" />
                  Editar
                </button>
              ) : (
                <div className="flex space-x-2">
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {saving ? 'Guardando...' : 'Guardar'}
                  </button>
                  <button
                    onClick={handleCancel}
                    className="inline-flex items-center px-4 py-2 border border-border rounded-md shadow-sm text-sm font-medium text-foreground bg-card hover:bg-muted focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                  >
                    <X className="h-4 w-4 mr-2" />
                    Cancelar
                  </button>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* First Name Field */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Nombre
                </label>
                {isEditing ? (
                  <Input
                    type="text"
                    value={formData.firstName}
                    onChange={(e) => handleInputChange('firstName', e.target.value)}
                    className="w-full bg-background border-border text-foreground"
                  />
                ) : (
                  <div className="flex items-center space-x-2 p-3 bg-muted rounded-md">
                    <User className="h-5 w-5 text-muted-foreground" />
                    <span className="text-foreground">{user.firstName}</span>
                  </div>
                )}
              </div>

              {/* Last Name Field */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Apellido
                </label>
                {isEditing ? (
                  <Input
                    type="text"
                    value={formData.lastName}
                    onChange={(e) => handleInputChange('lastName', e.target.value)}
                    className="w-full bg-background border-border text-foreground"
                  />
                ) : (
                  <div className="flex items-center space-x-2 p-3 bg-muted rounded-md">
                    <User className="h-5 w-5 text-muted-foreground" />
                    <span className="text-foreground">{user.lastName}</span>
                  </div>
                )}
              </div>

              {/* Email Field */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Correo Electrónico
                </label>
                {isEditing ? (
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className="w-full bg-background border-border text-foreground"
                  />
                ) : (
                  <div className="flex items-center space-x-2 p-3 bg-muted rounded-md">
                    <Mail className="h-5 w-5 text-muted-foreground" />
                    <span className="text-foreground">{user.email}</span>
                  </div>
                )}
              </div>


              {/* Career Field */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Carrera
                </label>
                {isEditing ? (
                  <Input
                    type="text"
                    value={formData.career}
                    onChange={(e) => handleInputChange('career', e.target.value)}
                    placeholder="Ej: Ingeniería de Sistemas"
                    className="w-full bg-background border-border text-foreground"
                  />
                ) : (
                  <div className="flex items-center space-x-2 p-3 bg-muted rounded-md">
                    <User className="h-5 w-5 text-muted-foreground" />
                    <span className="text-foreground">{user.carrer || 'No especificada'}</span>
                  </div>
                )}
              </div>

              {/* Bio Field - Full Width */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-foreground mb-2">
                  Biografía
                </label>
                {isEditing ? (
                  <textarea
                    value={formData.bio}
                    onChange={(e) => handleInputChange('bio', e.target.value)}
                    placeholder="Cuéntanos un poco sobre ti..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary resize-none"
                    rows={3}
                  />
                ) : (
                  <div className="p-3 bg-muted rounded-md">
                    <span className="text-foreground">{user.bio || 'Sin biografía'}</span>
                  </div>
                )}
              </div>

              {/* Registration Date */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Fecha de Registro
                </label>
                <div className="flex items-center space-x-2 p-3 bg-muted rounded-md">
                  <Calendar className="h-5 w-5 text-muted-foreground" />
                  <span className="text-foreground">
                    {new Date(user.created_at).toLocaleDateString('es-ES', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </span>
                </div>
              </div>
            </div>

            {/* Account Statistics */}
            <div className="mt-8 pt-6 border-t border-border">
              <h3 className="text-xl font-semibold text-foreground mb-4">Estadísticas de Cuenta</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-primary/10 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-primary">0</div>
                  <div className="text-sm text-primary/80">Tareas Completadas</div>
                </div>
                <div className="bg-blue-500/10 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-blue-500">0</div>
                  <div className="text-sm text-blue-500/80">Racha Actual</div>
                </div>
                <div className="bg-purple-500/10 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-purple-500">0</div>
                  <div className="text-sm text-purple-500/80">Días Activos</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
