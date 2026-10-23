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
  const [favorite, setFavorite] = useState(false);
  const [archived, setArchived] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    setTitle(item?.title ?? '');
    setDescription(item?.description ?? '');
    setTags(item?.tags.join(', ') ?? '');
    setFavorite(item?.favorite ?? false);
    setArchived(item?.status === 'archived');
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
        favorite,
        status: archived ? 'archived' : 'active',
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

        <div className="space-y-4 rounded-xl border border-slate-200/70 p-4 dark:border-white/8">
          <Toggle
            label={t('items.form.favorite')}
            hint={t('items.form.favoriteHint')}
            checked={favorite}
            onChange={setFavorite}
          />
          <Toggle
            label={t('items.form.archived')}
            hint={t('items.form.archivedHint')}
            checked={archived}
            onChange={setArchived}
          />
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
interface ToggleProps {
  label: string;
  hint: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}

function Toggle({ label, hint, checked, onChange }: ToggleProps) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div className="min-w-0">
        <div className="text-sm font-medium text-slate-700 dark:text-slate-300">{label}</div>
        <p className="mt-0.5 text-xs text-slate-400 dark:text-slate-500">{hint}</p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        onClick={() => onChange(!checked)}
        className={
          'relative h-6 w-11 shrink-0 rounded-full transition-colors ' +
          (checked ? 'bg-brand-600' : 'bg-slate-200 dark:bg-slate-700')
        }
      >
        <span
          className={
            'absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ' +
            (checked ? 'translate-x-[22px]' : 'translate-x-0.5')
          }
        />
      </button>
    </div>
  );
}
