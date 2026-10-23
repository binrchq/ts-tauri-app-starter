import { useEffect, useState, type FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { Modal } from '@/components/ui/modal';
import { Label } from '@/components/ui/label';
import type { Item, ItemInput } from '@/types';

export interface ItemFormModalProps {
  open: boolean;
  item: Item | null;
  onClose: () => void;
  onSave: (input: ItemInput) => Promise<void>;
}

export function ItemFormModal({ open, item, onClose, onSave }: ItemFormModalProps) {
  const { t } = useTranslation();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    setTitle(item?.title ?? '');
    setDescription(item?.description ?? '');
    setTags(item?.tags.join(', ') ?? '');
    setError(null);
    setSaving(false);
  }, [open, item]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmedTitle = title.trim();

    if (!trimmedTitle) {
      setError(t('items.form.titleRequired'));
      return;
    }

    setSaving(true);
    setError(null);

    try {
      await onSave({
        title: trimmedTitle,
        description: description.trim(),
        tags: tags
          .split(/[,，]/)
          .map((tag) => tag.trim())
          .filter(Boolean),
      });
      onClose();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : String(cause));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={item ? t('items.form.editTitle') : t('items.form.createTitle')}
      description={item ? t('items.form.editDescription') : t('items.form.createDescription')}
      footer={
        <div className="flex justify-end gap-3">
          <button type="button" className="btn-secondary" onClick={onClose} disabled={saving}>
            {t('common.cancel')}
          </button>
          <button type="submit" form="item-form" className="btn-primary" disabled={saving}>
            {saving ? t('common.saving') : item ? t('common.saveChanges') : t('common.create')}
          </button>
        </div>
      }
    >
      <form id="item-form" onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="item-title">{t('items.form.title')}</Label>
          <input
            id="item-title"
            className="form-control"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder={t('items.form.titlePlaceholder')}
            maxLength={120}
            autoFocus
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="item-description">{t('items.form.description')}</Label>
          <textarea
            id="item-description"
            className="form-control min-h-32 resize-y"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder={t('items.form.descriptionPlaceholder')}
            maxLength={2000}
          />
          <p className="text-right text-xs text-slate-400 dark:text-slate-500">
            {description.length}/2000
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="item-tags">{t('items.form.tags')}</Label>
          <input
            id="item-tags"
            className="form-control"
            value={tags}
            onChange={(event) => setTags(event.target.value)}
            placeholder={t('items.form.tagsPlaceholder')}
          />
          <p className="text-xs text-slate-400 dark:text-slate-500">{t('items.form.tagsHint')}</p>
        </div>

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300">
            {error}
          </div>
        )}
      </form>
    </Modal>
  );
}