!macro customInstall
  ; Custom install actions can go here
!macroend

!macro customUnInstall
  ; Custom uninstall actions
  ; Clean up any app data if needed
  RMDir /r "$APPDATA\${PRODUCT_NAME}"
!macroend
