const childProcess = require('child_process')

let purtyPath
switch (process.platform) {
case 'linux':
    purtyPath = require.resolve('purty/bin/linux/purty')
    break
case 'darwin':
    purtyPath = require.resolve('purty/bin/osx/purty')
    break
case 'win32':
    purtyPath = require.resolve('purty/bin/win/purty.exe')
    break
}

const CompositeDisposable = require('atom').CompositeDisposable

const PurtyAtom = {
    subscriptions: new CompositeDisposable(),
    DEBUG: false,
    config: {
        BEAUTIFY_ON_SAVE: {
            title: 'Force beautify when save',
            description: 'force beautify when save.',
            type: 'boolean',
            default: false
        },
        BEAUTIFY_ON_SAVE_ALL: {
            title: 'Force beautify when save-all',
            description: 'force beautify on modified files when save all.',
            type: 'boolean',
            default: false
        }
    },
    activate: function () {
        this.subscriptions.add(
            atom.commands.add(
                'atom-workspace',
                'purty:prettify',
                this.handlePrettify
            )
        )
        this.subscriptions.add(
            atom.commands.add(
                'atom-workspace',
                'core:save',
                this.handleSaveEvent
            )
        )
        this.subscriptions.add(
            atom.commands.add(
                'atom-workspace',
                'window:save-all',
                this.handleSaveAllEvent
            )
        )
    },
    deactivate: function () {
        this.subscriptions.dispose()
    },
    isPurescriptFile: function (editor) {
        if (editor && editor.getPath()) {
            return !!editor.getPath().endsWith('.purs')
        } else return false
    },
    handlePrettify: function () {
        const editor = atom.workspace.getActiveTextEditor()
        PurtyAtom.prettify(editor)
    },
    handleSaveEvent: function () {
        const beautify = atom.config.get('purty.BEAUTIFY_ON_SAVE')
        if (!beautify) return
        const editor = atom.workspace.getActiveTextEditor()
        PurtyAtom.prettify(editor)
    },
    handleSaveAllEvent: function () {
        const beautify = atom.config.get('purty.BEAUTIFY_ON_SAVE_ALL')
        if (!beautify) return

        const editors = atom.workspace.getTextEditors()
        editors.forEach(function (editor) {
            if (editor.isModified()) PurtyAtom.prettify(editor)
        })
    },
    prettify: function (editor) {
        if (!PurtyAtom.isPurescriptFile(editor)) return

        // const prev_position = editor.getCursorScreenPosition()

        try {
            childProcess.spawn(
                purtyPath,
                ['--write', editor.buffer.file.path],
                { stdio: 'inherit' }
            )
            // if (prev_position) editor.setCursorScreenPosition(prev_position)
        } catch (error) {
            atom.notifications.addError('Fail to prettify.', {
                detail: error
            })
        }
    }
}
module.exports = PurtyAtom
