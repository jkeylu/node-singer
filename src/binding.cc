#include "v8.h"
#include "node.h"
#include "node_pointer.h"
#include "mpg123.h"

using namespace v8;
using namespace node;

namespace {
#define CONST_INT(value) \
  target->Set(String::NewSymbol(#value), Integer::New(value), \
      static_cast<PropertyAttribute>(ReadOnly|DontDelete));

  Handle<Value> node_mpg123_volume(const Arguments& args) {
    HandleScope scope;
    mpg123_handle *mh = reinterpret_cast<mpg123_handle *>(UnwrapPointer(args[0]));
    double vol = args[1]->NumberValue();
    int ret = mpg123_volume(mh, vol);
    return scope.Close(Integer::New(ret));
  }

  Handle<Value> node_mpg123_getvolume(const Arguments& args) {
    HandleScope scope;
    mpg123_handle *mh = reinterpret_cast<mpg123_handle *>(UnwrapPointer(args[0]));

    double base;
    int ret = mpg123_getvolume(mh, &base, NULL, NULL);

    if (ret == MPG123_OK) return scope.Close(Number::New(base));
    else return scope.Close(Integer::New(ret));
  }

  void Initialize(Handle<Object> target) {
    HandleScope scope;

    // mpg123_errors
    CONST_INT(MPG123_DONE);  /**< Message: Track ended. Stop decoding. */
    CONST_INT(MPG123_NEW_FORMAT);  /**< Message: Output format will be different on next call.  Note that some libmpg123 versions between 1.4.3 and 1.8.0 insist on you calling mpg123_getformat() after getting this message code. Newer verisons behave like advertised: You have the chance to call mpg123_getformat(), but you can also just continue decoding and get your data. */
    CONST_INT(MPG123_NEED_MORE);  /**< Message: For feed reader: "Feed me more!" (call mpg123_feed() or mpg123_decode() with some new input data). */
    CONST_INT(MPG123_ERR);      /**< Generic Error */
    CONST_INT(MPG123_OK);       /**< Success */
    CONST_INT(MPG123_BAD_OUTFORMAT);   /**< Unable to set up output format! */
    CONST_INT(MPG123_BAD_CHANNEL);    /**< Invalid channel number specified. */
    CONST_INT(MPG123_BAD_RATE);    /**< Invalid sample rate specified.  */
    CONST_INT(MPG123_ERR_16TO8TABLE);  /**< Unable to allocate memory for 16 to 8 converter table! */
    CONST_INT(MPG123_BAD_PARAM);    /**< Bad parameter id! */
    CONST_INT(MPG123_BAD_BUFFER);    /**< Bad buffer given -- invalid pointer or too small size. */
    CONST_INT(MPG123_OUT_OF_MEM);    /**< Out of memory -- some malloc() failed. */
    CONST_INT(MPG123_NOT_INITIALIZED);  /**< You didn't initialize the library! */
    CONST_INT(MPG123_BAD_DECODER);    /**< Invalid decoder choice. */
    CONST_INT(MPG123_BAD_HANDLE);    /**< Invalid mpg123 handle. */
    CONST_INT(MPG123_NO_BUFFERS);    /**< Unable to initialize frame buffers (out of memory?). */
    CONST_INT(MPG123_BAD_RVA);      /**< Invalid RVA mode. */
    CONST_INT(MPG123_NO_GAPLESS);    /**< This build doesn't support gapless decoding. */
    CONST_INT(MPG123_NO_SPACE);    /**< Not enough buffer space. */
    CONST_INT(MPG123_BAD_TYPES);    /**< Incompatible numeric data types. */
    CONST_INT(MPG123_BAD_BAND);    /**< Bad equalizer band. */
    CONST_INT(MPG123_ERR_NULL);    /**< Null pointer given where valid storage address needed. */
    CONST_INT(MPG123_ERR_READER);    /**< Error reading the stream. */
    CONST_INT(MPG123_NO_SEEK_FROM_END);/**< Cannot seek from end (end is not known). */
    CONST_INT(MPG123_BAD_WHENCE);    /**< Invalid 'whence' for seek function.*/
    CONST_INT(MPG123_NO_TIMEOUT);    /**< Build does not support stream timeouts. */
    CONST_INT(MPG123_BAD_FILE);    /**< File access error. */
    CONST_INT(MPG123_NO_SEEK);     /**< Seek not supported by stream. */
    CONST_INT(MPG123_NO_READER);    /**< No stream opened. */
    CONST_INT(MPG123_BAD_PARS);    /**< Bad parameter handle. */
    CONST_INT(MPG123_BAD_INDEX_PAR);  /**< Bad parameters to mpg123_index() and mpg123_set_index() */
    CONST_INT(MPG123_OUT_OF_SYNC);  /**< Lost track in bytestream and did not try to resync. */
    CONST_INT(MPG123_RESYNC_FAIL);  /**< Resync failed to find valid MPEG data. */
    CONST_INT(MPG123_NO_8BIT);  /**< No 8bit encoding possible. */
    CONST_INT(MPG123_BAD_ALIGN);  /**< Stack aligmnent error */
    CONST_INT(MPG123_NULL_BUFFER);  /**< NULL input buffer with non-zero size... */
    CONST_INT(MPG123_NO_RELSEEK);  /**< Relative seek not possible (screwed up file offset) */
    CONST_INT(MPG123_NULL_POINTER); /**< You gave a null pointer somewhere where you shouldn't have. */
    CONST_INT(MPG123_BAD_KEY);   /**< Bad key value given. */
    CONST_INT(MPG123_NO_INDEX);  /**< No frame index in this build. */
    CONST_INT(MPG123_INDEX_FAIL);  /**< Something with frame index went wrong. */
    CONST_INT(MPG123_BAD_DECODER_SETUP);  /**< Something prevents a proper decoder setup */
    CONST_INT(MPG123_MISSING_FEATURE);  /**< This feature has not been built into libmpg123. */
    CONST_INT(MPG123_BAD_VALUE); /**< A bad value has been given, somewhere. */
    CONST_INT(MPG123_LSEEK_FAILED); /**< Low-level seek failed. */
    CONST_INT(MPG123_BAD_CUSTOM_IO); /**< Custom I/O not prepared. */
    CONST_INT(MPG123_LFS_OVERFLOW); /**< Offset value overflow during translation of large file API calls -- your client program cannot handle that large file. */


    NODE_SET_METHOD(target, "mpg123_volume", node_mpg123_volume);
    NODE_SET_METHOD(target, "mpg123_getvolume", node_mpg123_getvolume);
  }
} // anonymous namespace

NODE_MODULE(binding, Initialize)
