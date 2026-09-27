import { useNavigate, useParams } from 'react-router-dom';
import { UserX } from 'lucide-react';
import { Button, PageHeader, EmptyState, ErrorState, SkeletonCard } from '@/components/ui';
import { LearnerForm } from '@/components/dashboard/learners/LearnerForm';
import { learnerService } from '@/services';
import { useDocumentTitle, useResource } from '@/hooks';
import { paths } from '@/routes/paths';

function FormSkeleton() {
  return (
    <div className="grid gap-5 lg:grid-cols-3 lg:gap-6" aria-busy="true">
      <div className="space-y-5 lg:col-span-2">
        <SkeletonCard lines={4} />
        <SkeletonCard lines={6} />
      </div>
      <div className="space-y-5">
        <SkeletonCard lines={2} />
        <SkeletonCard lines={3} />
      </div>
      <span className="sr-only" role="status">
        Loading learner…
      </span>
    </div>
  );
}

export default function LearnerFormPage() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const { data: learner, loading, error, reload } = useResource(() => learnerService.get(id), [id], { enabled: isEdit });
  useDocumentTitle(isEdit ? (learner ? `Edit ${learner.fullName}` : 'Edit Learner') : 'Add Learner');

  const back = () => {
    if (window.history.state?.idx > 0) navigate(-1);
    else navigate(isEdit ? paths.learner(id) : paths.learners);
  };

  const breadcrumbs = [
    { label: 'Learners', to: paths.learners },
    ...(isEdit && learner ? [{ label: learner.fullName, to: paths.learner(id) }] : []),
    { label: isEdit ? 'Edit' : 'Add Learner' },
  ];

  const notFound = isEdit && error?.code === 'not_found';

  let body;
  if (isEdit && loading) body = <FormSkeleton />;
  else if (notFound)
    body = (
      <EmptyState
        icon={UserX}
        title="Learner not found"
        description="This learner may have been removed, or the link is incorrect."
        action={<Button to={paths.learners}>Back to learners</Button>}
      />
    );
  else if (isEdit && error) body = <ErrorState title="Couldn't load this learner" error={error} onRetry={reload} />;
  else
    body = (
      <LearnerForm
        key={learner?.id || 'new'}
        learner={isEdit ? learner : null}
        onSaved={(saved) => navigate(paths.learner(saved.id), { replace: !isEdit })}
        onCancel={back}
      />
    );

  return (
    <>
      <PageHeader
        breadcrumbs={breadcrumbs}
        title={isEdit ? 'Edit learner' : 'Add a learner'}
        description={
          isEdit
            ? 'Update contact details, test preferences and alert settings.'
            : 'Add contact details and test preferences. SlotPilot will alert you when a matching slot appears.'
        }
      />
      {body}
    </>
  );
}
