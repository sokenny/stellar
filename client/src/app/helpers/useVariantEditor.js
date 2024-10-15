import { useRef } from 'react';
import useStore from '../store';
import { toast } from 'sonner';

function useVariantEditor({ experiment, onSuccess }) {
  const { token, refetchProjects } = useStore();
  const variantsCheckIntervalRef = useRef(null);

  const handleEditVariant = (variantId, onVariantModifiedCallback) => {
    window.open(
      `${experiment.url}?stellarMode=true&experimentId=${experiment.id}&variantId=${variantId}&visualEditorOn=true&token=${token}`,
      '_blank',
    );

    if (variantsCheckIntervalRef.current) {
      clearInterval(variantsCheckIntervalRef.current); // Ensure no intervals are duplicated
    }

    variantsCheckIntervalRef.current = setInterval(async () => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_STELLAR_API}/api/experiment/${experiment.id}`,
      );
      const experimentJson = await res.json();
      const variant = experimentJson.variants.find((v) => v.id === variantId);
      const prevVariant = experiment.variants.find((v) => v.id === variantId);
      const variantModified =
        prevVariant && variant && prevVariant.updated_at !== variant.updated_at;

      if (variantModified) {
        clearInterval(variantsCheckIntervalRef.current);
        toast.success('Variant modified successfully!');
        onSuccess && onSuccess();
        refetchProjects();
        if (typeof onVariantModifiedCallback === 'function') {
          onVariantModifiedCallback(experimentJson); // Execute the callback
        }
      }
    }, 1500);
  };

  return { handleEditVariant };
}

export default useVariantEditor;
