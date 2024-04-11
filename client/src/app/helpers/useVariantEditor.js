import { useRef } from 'react';
import { toast } from 'sonner';

function useVariantEditor({ experiment }) {
  const variantsCheckIntervalRef = useRef(null);

  const handleEditVariant = (variantId, onVariantModifiedCallback) => {
    window.open(
      `${experiment.url}?stellarMode=true&experimentId=${experiment.id}&variantId=${variantId}&visualEditorOn=true`,
      '_blank',
    );

    if (variantsCheckIntervalRef.current) {
      clearInterval(variantsCheckIntervalRef.current); // Ensure no intervals are duplicated
    }

    variantsCheckIntervalRef.current = setInterval(async () => {
      console.log('interval iter');
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_STELLAR_API}/experiment/${experiment.id}`,
      );
      const experimentJson = await res.json();
      const variant = experimentJson.variants.find((v) => v.id === variantId);
      const prevVariant = experiment.variants.find((v) => v.id === variantId);
      const variantModified =
        prevVariant && variant && prevVariant.updated_at !== variant.updated_at;

      if (variantModified) {
        clearInterval(variantsCheckIntervalRef.current);
        toast.success('Variant modified successfully!');
        if (typeof onVariantModifiedCallback === 'function') {
          onVariantModifiedCallback(experimentJson); // Execute the callback
        }
      }
    }, 1500);
  };

  return { handleEditVariant };
}

export default useVariantEditor;
