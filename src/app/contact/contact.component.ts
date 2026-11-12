import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatCheckbox } from '@angular/material/checkbox';
import { MAT_DIALOG_DATA, MatDialogActions, MatDialogClose, MatDialogContent, MatDialogRef } from '@angular/material/dialog';
import { MatFormField, MatHint, MatLabel } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatRadioButton, MatRadioGroup } from '@angular/material/radio';
import { MatSnackBar } from '@angular/material/snack-bar';

export interface ContactDialogData {
    model?: string;
    multEqType?: string;
    channels?: string[];
    appVersion: string;
}

type ContactType = 'question' | 'feature' | 'bug';

@Component({
    selector: 'app-contact',
    imports: [
        FormsModule,
        MatCheckbox,
        MatDialogContent,
        MatDialogActions,
        MatDialogClose,
        MatFormField,
        MatHint,
        MatInput,
        MatLabel,
        MatRadioButton,
        MatRadioGroup,
    ],
    templateUrl: './contact.component.html',
    styleUrl: './contact.component.scss',
})
export class ContactComponent {
    private data = inject<ContactDialogData>(MAT_DIALOG_DATA);
    private dialogRef = inject(MatDialogRef<ContactComponent>);
    private snackBar = inject(MatSnackBar);
    private cdr = inject(ChangeDetectorRef);

    readonly maxMessageLength = 3800;
    readonly hasAdyData = Boolean(this.data.model || this.data.channels?.length);

    type: ContactType = 'question';
    message = '';
    contact = '';
    sendStats = this.hasAdyData;
    isSubmitting = false;

    async submit() {
        const trimmedMessage = this.message.trim();
        if (!trimmedMessage || this.isSubmitting) return;

        this.isSubmitting = true;
        this.cdr.markForCheck();

        try {
            const response = await fetch('/contact.api', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    type: this.type,
                    message: trimmedMessage,
                    contact: this.contact.trim() || undefined,
                    stats: this.hasAdyData && this.sendStats ? {
                        model: this.data.model,
                        multEqType: this.data.multEqType,
                        channels: this.data.channels,
                        appVersion: this.data.appVersion,
                        screenSize: `${window.screen.width} × ${window.screen.height}`,
                    } : undefined,
                }),
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }

            this.dialogRef.close(true);
            this.snackBar.open('Message sent! Thank you for your feedback.', 'Dismiss', { duration: 5000 });
        } catch (error) {
            console.warn('Could not send contact message.', error);
            this.isSubmitting = false;
            this.cdr.markForCheck();
            this.snackBar.open('Could not send the message. Please try again.', 'Dismiss', { duration: 5000 });
        }
    }
}
