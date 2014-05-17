DEL /F /Q "build\Release\binding.exp"
DEL /F /Q "build\Release\binding.lib"
DEL /F /Q "build\Release\binding.pdb"
DEL /F /Q "build\Release\libmpg123.lib"
RMDIR /Q /S "build\Release\obj"
node-pre-gyp package
