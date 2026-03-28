/**
 * ArchitectureCard - Card component for architecture list with actions
 * Displays architecture info with rename, edit, and delete capabilities
 */

import { AnimatePresence, motion } from 'framer-motion';
import { Check, MoreVertical, Pencil, Trash2, X } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { cn } from '@/shared/lib/cn';
import type { Architecture } from '@/shared/types';
import { Badge, Button, Input, Modal, ModalFooter } from '@/shared/ui';

interface ArchitectureCardProps {
  architecture: Architecture;
  onRename: (id: string, newName: string) => void;
  onDelete: (id: string) => void;
  isDeleting?: boolean;
}

export function ArchitectureCard({
  architecture,
  onRename,
  onDelete,
  isDeleting = false,
}: ArchitectureCardProps) {
  const [showMenu, setShowMenu] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(architecture.name);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    };

    if (showMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showMenu]);

  // Focus input when editing
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleStartEdit = useCallback(() => {
    setEditName(architecture.name);
    setIsEditing(true);
    setShowMenu(false);
  }, [architecture.name]);

  const handleCancelEdit = useCallback(() => {
    setIsEditing(false);
    setEditName(architecture.name);
  }, [architecture.name]);

  const handleSaveEdit = useCallback(() => {
    const trimmedName = editName.trim();
    if (trimmedName && trimmedName !== architecture.name) {
      onRename(architecture.id, trimmedName);
    }
    setIsEditing(false);
  }, [editName, architecture.id, architecture.name, onRename]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') {
        handleSaveEdit();
      } else if (e.key === 'Escape') {
        handleCancelEdit();
      }
    },
    [handleSaveEdit, handleCancelEdit],
  );

  const handleDeleteClick = useCallback(() => {
    setShowMenu(false);
    setShowDeleteConfirm(true);
  }, []);

  const handleConfirmDelete = useCallback(() => {
    onDelete(architecture.id);
    setShowDeleteConfirm(false);
  }, [architecture.id, onDelete]);

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <>
      <motion.div
        layout
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className={cn(
          'group relative bg-surface-200 rounded-xl border border-surface-400',
          'hover:border-primary/50 transition-colors',
          isDeleting && 'opacity-50 pointer-events-none',
        )}
      >
        {/* Card Content */}
        <Link
          to={`/builder/${architecture.id}`}
          className={cn('block p-4', isEditing && 'pointer-events-none')}
        >
          {/* Header with name and menu */}
          <div className="flex items-start justify-between gap-2 mb-2">
            {isEditing ? (
              <fieldset
                aria-label="Edit architecture name"
                className="flex-1 flex items-center gap-2 pointer-events-auto border-0 p-0 m-0"
              >
                <Input
                  ref={inputRef}
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="h-8 text-sm font-semibold"
                  onClick={(e) => e.stopPropagation()}
                />
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-success hover:bg-success/10"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleSaveEdit();
                  }}
                >
                  <Check className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-text-muted hover:bg-surface-300"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleCancelEdit();
                  }}
                >
                  <X className="w-4 h-4" />
                </Button>
              </fieldset>
            ) : (
              <>
                <h3 className="font-semibold text-text-primary truncate flex-1">
                  {architecture.name}
                </h3>
                <div ref={menuRef} className="relative">
                  <Button
                    variant="ghost"
                    size="icon"
                    className={cn(
                      'h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity',
                      showMenu && 'opacity-100',
                    )}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setShowMenu(!showMenu);
                    }}
                  >
                    <MoreVertical className="w-4 h-4" />
                  </Button>

                  {/* Dropdown Menu */}
                  <AnimatePresence>
                    {showMenu && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: -4 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: -4 }}
                        transition={{ duration: 0.1 }}
                        className={cn(
                          'absolute right-0 top-full mt-1 z-10',
                          'bg-surface-300 rounded-lg border border-surface-400 shadow-lg',
                          'py-1 min-w-[140px]',
                        )}
                      >
                        <button
                          type="button"
                          className={cn(
                            'w-full flex items-center gap-2 px-3 py-2 text-sm',
                            'text-text-secondary hover:text-text-primary hover:bg-surface-400',
                            'transition-colors',
                          )}
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleStartEdit();
                          }}
                        >
                          <Pencil className="w-4 h-4" />
                          Rename
                        </button>
                        <button
                          type="button"
                          className={cn(
                            'w-full flex items-center gap-2 px-3 py-2 text-sm',
                            'text-error hover:bg-error/10',
                            'transition-colors',
                          )}
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleDeleteClick();
                          }}
                        >
                          <Trash2 className="w-4 h-4" />
                          Delete
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </>
            )}
          </div>

          {/* Type badge */}
          <div className="mb-3">
            <Badge variant={architecture.type} size="sm">
              {architecture.type}
            </Badge>
          </div>

          {/* Stats */}
          <div className="flex items-center gap-4 text-xs text-text-muted">
            <span>{architecture.nodes.length} nodes</span>
            <span>{architecture.edges.length} connections</span>
          </div>

          {/* Footer */}
          <div className="mt-3 pt-3 border-t border-surface-400">
            <p className="text-xs text-text-muted">
              Updated {formatDate(architecture.updatedAt)}
            </p>
          </div>
        </Link>
      </motion.div>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        title="Delete Architecture"
        size="sm"
      >
        <p className="text-text-secondary">
          Are you sure you want to delete{' '}
          <span className="font-semibold text-text-primary">
            "{architecture.name}"
          </span>
          ? This action cannot be undone.
        </p>
        <ModalFooter>
          <Button variant="ghost" onClick={() => setShowDeleteConfirm(false)}>
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={handleConfirmDelete}
            loading={isDeleting}
          >
            Delete
          </Button>
        </ModalFooter>
      </Modal>
    </>
  );
}
