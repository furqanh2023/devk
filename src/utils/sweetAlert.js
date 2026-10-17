import Swal from 'sweetalert2';
import 'sweetalert2/dist/sweetalert2.min.css';

const sharedOptions = {
  buttonsStyling: false,
  showCloseButton: true,
  reverseButtons: true,
  focusConfirm: false,
  customClass: {
    popup: 'devk-swal-popup',
    title: 'devk-swal-title',
    htmlContainer: 'devk-swal-text',
    confirmButton: 'devk-swal-confirm',
    cancelButton: 'devk-swal-cancel',
    denyButton: 'devk-swal-cancel',
    input: 'devk-swal-input',
    select: 'devk-swal-input',
    actions: 'devk-swal-actions'
  }
};

export function showMessage(title, text = '', icon = 'info') {
  return Swal.fire({
    ...sharedOptions,
    icon,
    title,
    text,
    confirmButtonText: 'Got it'
  });
}

export function askText({
  title,
  text = '',
  defaultValue = '',
  placeholder = '',
  required = true,
  requiredMessage = 'Please enter a value.',
  confirmButtonText = 'Continue',
  input = 'text',
  inputOptions
}) {
  return Swal.fire({
    ...sharedOptions,
    title,
    text,
    input,
    inputOptions,
    inputValue: defaultValue,
    inputPlaceholder: placeholder,
    inputAttributes: { 'aria-label': title },
    showCancelButton: true,
    confirmButtonText,
    cancelButtonText: 'Cancel',
    allowOutsideClick: false,
    inputValidator: value => {
      if (required && !String(value ?? '').trim()) return requiredMessage;
      return undefined;
    }
  });
}
