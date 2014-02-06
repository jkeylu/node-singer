{
  'targets': [
    {
      'target_name': 'binding',
        'sources': [
          'src/binding.cc'
        ],
        'dependencies': [
          'deps/libmpg123/mpg123.gyp:output'
        ]
    }
  ]
}
