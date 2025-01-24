import { useRef } from 'react';
import useStore from '../store';
import { toast } from 'sonner';

function useVariantEditor({ experiment, onMissingEditorUrl }) {
  const { token } = useStore();
  const variantsCheckIntervalRef = useRef(null);

  const handleEditVariant = (variantId) => {
    if (!experiment.editor_url) {
      toast.error('Please set an editor URL before editing variants');
      return;
    }

    const currentUrl = window.location.href;
    // Determine the correct separator based on whether editor_url already has query params
    const separator = experiment.editor_url.includes('?') ? '&' : '?';
    window.open(
      `${experiment.editor_url}${separator}stellarMode=true&experimentId=${experiment.id}&variantId=${variantId}&visualEditorOn=true&token=${token}&fromUrl=${currentUrl}`,
      '_blank',
    );

    if (variantsCheckIntervalRef.current) {
      clearInterval(variantsCheckIntervalRef.current); // Ensure no intervals are duplicated
    }
  };

  return { handleEditVariant };
}

export default useVariantEditor;
