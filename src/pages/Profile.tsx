/**
 * Profile Page - User profile management
 * Allows users to view and update their profile, change password, and delete account
 */

import { motion } from 'framer-motion';
import {
  AlertTriangle,
  Eye,
  EyeOff,
  Loader2,
  Mail,
  Save,
  Trash2,
  User,
} from 'lucide-react';
import { useEffect, useId, useState } from 'react';
import { useUser } from '@/app/store';
import { getApiErrorMessage } from '@/shared/api/client';
import {
  useDeleteAccount,
  useUpdateProfile,
  useUserProfile,
} from '@/shared/api/hooks';
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Divider,
  Input,
  Modal,
  ModalFooter,
} from '@/shared/ui';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring', stiffness: 300, damping: 24 },
  },
};

export function ProfilePage() {
  const formId = useId();
  const authUser = useUser();

  // API hooks
  const { data: profile, isLoading: isLoadingProfile } = useUserProfile();
  const updateProfile = useUpdateProfile();
  const deleteAccount = useDeleteAccount();

  // Form state
  const [name, setName] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);

  // Delete confirmation modal
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState('');

  // Initialize form with user data
  useEffect(() => {
    if (profile) {
      setName(profile.name);
    } else if (authUser) {
      setName(authUser.name);
    }
  }, [profile, authUser]);

  // Set page title
  useEffect(() => {
    document.title = 'Profile | Frontend Architecture Simulator';
  }, []);

  const handleUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setFormSuccess(null);

    // Validate
    if (!name.trim()) {
      setFormError('Name is required');
      return;
    }

    // Check if changing password
    const isChangingPassword =
      currentPassword || newPassword || confirmPassword;
    if (isChangingPassword) {
      if (!currentPassword) {
        setFormError('Current password is required to change password');
        return;
      }
      if (!newPassword) {
        setFormError('New password is required');
        return;
      }
      if (newPassword.length < 8) {
        setFormError('New password must be at least 8 characters');
        return;
      }
      if (newPassword !== confirmPassword) {
        setFormError('New passwords do not match');
        return;
      }
    }

    const updateData: {
      name?: string;
      currentPassword?: string;
      newPassword?: string;
    } = {};

    // Only include name if it changed
    if (name.trim() !== (profile?.name || authUser?.name)) {
      updateData.name = name.trim();
    }

    // Include password change if provided
    if (isChangingPassword) {
      updateData.currentPassword = currentPassword;
      updateData.newPassword = newPassword;
    }

    // Don't submit if nothing changed
    if (Object.keys(updateData).length === 0) {
      setFormError('No changes to save');
      return;
    }

    updateProfile.mutate(updateData, {
      onSuccess: () => {
        setFormSuccess('Profile updated successfully');
        // Clear password fields
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      },
      onError: (error) => {
        setFormError(getApiErrorMessage(error));
      },
    });
  };

  const handleDeleteAccount = () => {
    if (deleteConfirmation !== 'DELETE') {
      return;
    }

    deleteAccount.mutate(undefined, {
      onError: (error) => {
        setFormError(getApiErrorMessage(error));
        setShowDeleteModal(false);
      },
    });
  };

  if (isLoadingProfile) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-auto p-6">
      <motion.div
        className="max-w-2xl mx-auto space-y-6"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Header */}
        <motion.div variants={itemVariants}>
          <h1 className="text-2xl font-bold text-text-primary">Profile</h1>
          <p className="mt-1 text-text-secondary">
            Manage your account settings
          </p>
        </motion.div>

        {/* Profile Info Card */}
        <motion.div variants={itemVariants}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Profile Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form
                id={`${formId}-profile`}
                onSubmit={handleUpdateProfile}
                className="space-y-5"
              >
                {/* Success Message */}
                {formSuccess && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-3 rounded-lg bg-success/10 border border-success/20"
                  >
                    <p className="text-sm text-success">{formSuccess}</p>
                  </motion.div>
                )}

                {/* Error Message */}
                {formError && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-3 rounded-lg bg-error/10 border border-error/20"
                    role="alert"
                  >
                    <p className="text-sm text-error">{formError}</p>
                  </motion.div>
                )}

                {/* Email (read-only) */}
                <Input
                  type="email"
                  label="Email"
                  value={profile?.email || authUser?.email || ''}
                  leftIcon={<Mail className="w-4 h-4" />}
                  disabled
                  helperText="Email cannot be changed"
                />

                {/* Name */}
                <Input
                  type="text"
                  label="Name"
                  placeholder="Your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  leftIcon={<User className="w-4 h-4" />}
                  disabled={updateProfile.isPending}
                  required
                />

                <Divider />

                {/* Password Change Section */}
                <div>
                  <h3 className="text-sm font-medium text-text-primary mb-4">
                    Change Password
                  </h3>
                  <div className="space-y-4">
                    {/* Current Password */}
                    <Input
                      type={showCurrentPassword ? 'text' : 'password'}
                      label="Current Password"
                      placeholder="Enter current password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      autoComplete="current-password"
                      disabled={updateProfile.isPending}
                      rightIcon={
                        <button
                          type="button"
                          onClick={() =>
                            setShowCurrentPassword(!showCurrentPassword)
                          }
                          className="text-text-muted hover:text-text-primary transition-colors p-1 -m-1 cursor-pointer"
                          tabIndex={-1}
                        >
                          {showCurrentPassword ? (
                            <EyeOff className="w-4 h-4" />
                          ) : (
                            <Eye className="w-4 h-4" />
                          )}
                        </button>
                      }
                    />

                    {/* New Password */}
                    <Input
                      type={showNewPassword ? 'text' : 'password'}
                      label="New Password"
                      placeholder="Enter new password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      autoComplete="new-password"
                      disabled={updateProfile.isPending}
                      helperText="Must be at least 8 characters"
                      rightIcon={
                        <button
                          type="button"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          className="text-text-muted hover:text-text-primary transition-colors p-1 -m-1 cursor-pointer"
                          tabIndex={-1}
                        >
                          {showNewPassword ? (
                            <EyeOff className="w-4 h-4" />
                          ) : (
                            <Eye className="w-4 h-4" />
                          )}
                        </button>
                      }
                    />

                    {/* Confirm New Password */}
                    <Input
                      type={showConfirmPassword ? 'text' : 'password'}
                      label="Confirm New Password"
                      placeholder="Re-enter new password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      autoComplete="new-password"
                      disabled={updateProfile.isPending}
                      rightIcon={
                        <button
                          type="button"
                          onClick={() =>
                            setShowConfirmPassword(!showConfirmPassword)
                          }
                          className="text-text-muted hover:text-text-primary transition-colors p-1 -m-1 cursor-pointer"
                          tabIndex={-1}
                        >
                          {showConfirmPassword ? (
                            <EyeOff className="w-4 h-4" />
                          ) : (
                            <Eye className="w-4 h-4" />
                          )}
                        </button>
                      }
                    />
                  </div>
                </div>

                {/* Submit Button */}
                <div className="flex justify-end">
                  <Button
                    type="submit"
                    loading={updateProfile.isPending}
                    leftIcon={<Save className="w-4 h-4" />}
                  >
                    Save Changes
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </motion.div>

        {/* Account Stats */}
        {profile?.architecturesCount !== undefined && (
          <motion.div variants={itemVariants}>
            <Card>
              <CardHeader>
                <CardTitle>Account Statistics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-lg bg-surface-300">
                    <p className="text-2xl font-bold text-text-primary">
                      {profile.architecturesCount}
                    </p>
                    <p className="text-sm text-text-secondary">Architectures</p>
                  </div>
                  <div className="p-4 rounded-lg bg-surface-300">
                    <p className="text-2xl font-bold text-text-primary">
                      {profile.createdAt
                        ? new Date(profile.createdAt).toLocaleDateString()
                        : 'N/A'}
                    </p>
                    <p className="text-sm text-text-secondary">Member since</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Danger Zone */}
        <motion.div variants={itemVariants}>
          <Card className="border-error/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-error">
                <AlertTriangle className="w-5 h-5" />
                Danger Zone
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-text-secondary mb-4">
                Once you delete your account, there is no going back. Please be
                certain.
              </p>
              <Button
                variant="danger"
                onClick={() => setShowDeleteModal(true)}
                leftIcon={<Trash2 className="w-4 h-4" />}
              >
                Delete Account
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>

      {/* Delete Account Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setDeleteConfirmation('');
        }}
        title="Delete Account"
        description="This action cannot be undone. All your data will be permanently deleted."
        size="sm"
      >
        <div className="space-y-4">
          <div className="p-4 rounded-lg bg-error/10 border border-error/20">
            <p className="text-sm text-error">
              This will permanently delete your account and all associated data,
              including all your architectures.
            </p>
          </div>

          <Input
            label="Type DELETE to confirm"
            placeholder="DELETE"
            value={deleteConfirmation}
            onChange={(e) => setDeleteConfirmation(e.target.value)}
          />
        </div>

        <ModalFooter>
          <Button
            variant="ghost"
            onClick={() => {
              setShowDeleteModal(false);
              setDeleteConfirmation('');
            }}
          >
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={handleDeleteAccount}
            loading={deleteAccount.isPending}
            disabled={deleteConfirmation !== 'DELETE'}
          >
            Delete Account
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}

export default ProfilePage;
