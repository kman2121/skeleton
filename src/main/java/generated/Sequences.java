/**
 * This class is generated by jOOQ
 */
package generated;


import javax.annotation.Generated;

import org.jooq.Sequence;
import org.jooq.impl.SequenceImpl;


/**
 * Convenience access to all sequences in public
 */
@Generated(
	value = {
		"http://www.jooq.org",
		"jOOQ version:3.7.4"
	},
	comments = "This class is generated by jOOQ"
)
@SuppressWarnings({ "all", "unchecked", "rawtypes" })
public class Sequences {

	/**
	 * The sequence <code>public.system_sequence_860572b4_6d9e_43ba_9546_cf3e607dbfc6</code>
	 */
	public static final Sequence<Long> SYSTEM_SEQUENCE_860572B4_6D9E_43BA_9546_CF3E607DBFC6 = new SequenceImpl<Long>("system_sequence_860572b4_6d9e_43ba_9546_cf3e607dbfc6", Public.PUBLIC, org.jooq.impl.SQLDataType.BIGINT);

	/**
	 * The sequence <code>public.system_sequence_9f48a0a5_98ff_45e0_8ca6_cc980571873f</code>
	 */
	public static final Sequence<Long> SYSTEM_SEQUENCE_9F48A0A5_98FF_45E0_8CA6_CC980571873F = new SequenceImpl<Long>("system_sequence_9f48a0a5_98ff_45e0_8ca6_cc980571873f", Public.PUBLIC, org.jooq.impl.SQLDataType.BIGINT);
}
