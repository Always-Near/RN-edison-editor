# rn-edison-editor Code Logic

## `src/index.tsx`

- `copyFile`

  The html file needs to be copied to the application's local path when the project starts. We can only show images in the same path with html file when we want to show local images in the webview. And the html files may be updated, we need to delete the old files and add a new one. Then we get a file path to show for webview.

- `doSomethingAfterMounted`

  Some actions must wait until the web page is mounted. So there is a queue waiting for the web page to mount.

- `AddToDoSometingAfterkeyboardDidShow`

  Some actions must wait until the keyboard is open. So there is a queue waiting for the keyboard show.

- `afterFocusLeaveEditor`

  Some actions may cause the cursor to leave the editor, such as selecting a color or a font. When the change is complete, we need to jump the cursor back to its original position.

- `shouldForceDarkOn`

  The webview supports dark mode in some device.

- `focusSpecialHandleForSpecialPlatform`

  On Android, you need to focus on the webview first when to focus into the editor. And focus on the webview may not make the keyboard pop up, so focus on a hidden input to make the keyboard pop up.
