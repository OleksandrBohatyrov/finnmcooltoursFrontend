import React from 'react'
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogContentText from '@mui/material/DialogContentText'
import DialogTitle from '@mui/material/DialogTitle'

export default function NotesDialog({ open, onClose, notes }) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      aria-labelledby="notes-dialog-title"
      aria-describedby="notes-dialog-description"
    >
      <DialogTitle id="notes-dialog-title">Passenger Notes</DialogTitle>
      <DialogContent>
        <DialogContentText id="notes-dialog-description">
          {notes || 'No notes available.'}
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  )
}
