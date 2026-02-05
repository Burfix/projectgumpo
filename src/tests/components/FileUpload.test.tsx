import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import FileUpload from '@/components/ui/FileUpload';

describe('FileUpload Component', () => {
  it('should render file upload button', () => {
    const onFileSelect = vi.fn();
    render(<FileUpload onFileSelect={onFileSelect} />);

    expect(screen.getByText(/choose file/i)).toBeInTheDocument();
  });

  it('should handle file selection', async () => {
    const onFileSelect = vi.fn();
    render(<FileUpload onFileSelect={onFileSelect} />);

    const file = new File(['test image'], 'test.png', { type: 'image/png' });
    const input = screen.getByLabelText(/choose file/i) as HTMLInputElement;

    // Mock FileReader
    const mockFileReader = {
      readAsDataURL: vi.fn(),
      onload: null as any,
      result: 'data:image/png;base64,test',
    };
    global.FileReader = vi.fn(() => mockFileReader) as any;

    fireEvent.change(input, { target: { files: [file] } });

    // Simulate FileReader onload
    if (mockFileReader.onload) {
      mockFileReader.onload({ target: mockFileReader } as any);
    }

    await waitFor(() => {
      expect(onFileSelect).toHaveBeenCalledWith(file);
    });
  });

  it('should reject files larger than 5MB', async () => {
    const onFileSelect = vi.fn();
    render(<FileUpload onFileSelect={onFileSelect} />);

    const largeFile = new File(['x'.repeat(6 * 1024 * 1024)], 'large.png', {
      type: 'image/png',
    });
    const input = screen.getByLabelText(/choose file/i) as HTMLInputElement;

    fireEvent.change(input, { target: { files: [largeFile] } });

    await waitFor(() => {
      expect(screen.getByText(/file size must be less than 5mb/i)).toBeInTheDocument();
    });

    expect(onFileSelect).not.toHaveBeenCalled();
  });

  it('should reject non-image files', async () => {
    const onFileSelect = vi.fn();
    render(<FileUpload onFileSelect={onFileSelect} accept="image/*" />);

    const textFile = new File(['test'], 'test.txt', { type: 'text/plain' });
    const input = screen.getByLabelText(/choose file/i) as HTMLInputElement;

    fireEvent.change(input, { target: { files: [textFile] } });

    await waitFor(() => {
      expect(screen.getByText(/invalid file type/i)).toBeInTheDocument();
    });

    expect(onFileSelect).not.toHaveBeenCalled();
  });

  it('should show preview for selected image', async () => {
    const onFileSelect = vi.fn();
    render(<FileUpload onFileSelect={onFileSelect} />);

    const file = new File(['image'], 'test.png', { type: 'image/png' });
    const input = screen.getByLabelText(/choose file/i) as HTMLInputElement;

    const mockFileReader = {
      readAsDataURL: vi.fn(),
      onload: null as any,
      result: 'data:image/png;base64,imagedata',
    };
    global.FileReader = vi.fn(() => mockFileReader) as any;

    fireEvent.change(input, { target: { files: [file] } });

    if (mockFileReader.onload) {
      mockFileReader.onload({ target: mockFileReader } as any);
    }

    await waitFor(() => {
      const preview = screen.getByAltText('Upload preview');
      expect(preview).toBeInTheDocument();
      expect(preview).toHaveAttribute('src', 'data:image/png;base64,imagedata');
    });
  });

  it('should remove file when remove button clicked', async () => {
    const onFileSelect = vi.fn();
    render(<FileUpload onFileSelect={onFileSelect} />);

    const file = new File(['image'], 'test.png', { type: 'image/png' });
    const input = screen.getByLabelText(/choose file/i) as HTMLInputElement;

    const mockFileReader = {
      readAsDataURL: vi.fn(),
      onload: null as any,
      result: 'data:image/png;base64,test',
    };
    global.FileReader = vi.fn(() => mockFileReader) as any;

    fireEvent.change(input, { target: { files: [file] } });

    if (mockFileReader.onload) {
      mockFileReader.onload({ target: mockFileReader } as any);
    }

    await waitFor(() => {
      expect(screen.getByAltText('Upload preview')).toBeInTheDocument();
    });

    const removeButton = screen.getByRole('button', { name: /remove/i });
    fireEvent.click(removeButton);

    await waitFor(() => {
      expect(screen.queryByAltText('Upload preview')).not.toBeInTheDocument();
    });
  });

  it('should disable upload when disabled prop is true', () => {
    const onFileSelect = vi.fn();
    render(<FileUpload onFileSelect={onFileSelect} disabled={true} />);

    const input = screen.getByLabelText(/choose file/i) as HTMLInputElement;
    expect(input).toBeDisabled();
  });
});
