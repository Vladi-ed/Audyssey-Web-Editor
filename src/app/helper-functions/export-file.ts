type SavePickerWindow = Window & {
    showSaveFilePicker?: (options: {
        suggestedName: string;
        types: { description: string; accept: Record<string, string[]> }[];
    }) => Promise<FileSystemFileHandle>;
};

export async function exportFile(data: unknown, filename = 'export', fileType = 'txt'): Promise<boolean> {
    const name = `${filename}_${new Date().toLocaleDateString()}.${fileType}`
        .replace(/[<>:"/\\|?*\u0000-\u001f]/g, '_');
    const blob = new Blob([JSON.stringify(data)], { type: 'application/json' });
    const browser = window as SavePickerWindow;

    if (typeof browser.showSaveFilePicker === 'function') {
        let handle: FileSystemFileHandle;
        try {
            handle = await browser.showSaveFilePicker({
                suggestedName: name,
                types: [{ description: `${fileType.toUpperCase()} file`, accept: { 'application/json': [`.${fileType}`] } }],
            });
        } catch (error) {
            if (error instanceof DOMException && error.name === 'AbortError') return false;
            throw error;
        }

        const writable = await handle.createWritable();
        try {
            await writable.write(blob);
            await writable.close();
        } catch (error) {
            await writable.abort().catch(() => {});
            throw error;
        }
        return true;
    }

    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = name;
    link.click();
    // Give the browser time to start reading the download before releasing it.
    setTimeout(() => URL.revokeObjectURL(url), 60_000);
    return true;
}
