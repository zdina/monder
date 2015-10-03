import java.io.BufferedReader;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.net.HttpURLConnection;
import java.net.URL;
import java.net.URLConnection;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.Statement;

import org.apache.commons.io.IOUtils;
import org.json.JSONObject;
import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;
import org.jsoup.select.Elements;

public class Main {

	// public static String doesExist(String id_name, String fieldName, String
	// fieldValue) {
	// String check = "SELECT " + id_name + " FROM movie WHERE " + fieldName +
	// "=" + id;
	// Statement checkStm = connection.createStatement();
	// ResultSet checkRs = checkStm.executeQuery(check);
	// }

	public static void main(String[] args) throws Exception {
		// Connect to Postgres db
		Class.forName("org.postgresql.Driver");
		Connection connection = null;
		connection = DriverManager.getConnection(
				"jdbc:postgresql://localhost:5432/monderdb", "dinazverinski",
				"");

		// Query RESTful API
		// Parse IMDB top 250 first
		Document doc = Jsoup.connect("http://www.imdb.com/chart/top").get();
		Elements titles = doc.select("td.titleColumn").select("a");
		for (Element titleElement : titles) {

			String title = titleElement.text();
			title = title.replace(" ", "+");

			URL url = new URL("http://www.omdbapi.com/?t=" + title
					+ "&y=&plot=short&r=json");
			HttpURLConnection conn = (HttpURLConnection) url.openConnection();
			conn.setRequestMethod("GET");
			conn.setRequestProperty("Accept", "application/json");

			if (conn.getResponseCode() != 200) {
				throw new RuntimeException("Failed : HTTP error code : "
						+ conn.getResponseCode());
			}

			BufferedReader br = new BufferedReader(new InputStreamReader(
					(conn.getInputStream())));

			String output;
			System.out.println("Output from Server .... \n");
			if ((output = br.readLine()) != null) {
				System.out.println(output);

				JSONObject jo = new JSONObject(output);
				if (jo.has("Error"))
					continue;
				try {
					String id = jo.getString("imdbID");
					String actual_title = jo.getString("Title");
					int year = Integer.parseInt(jo.getString("Year"));
					int runtime = Integer.parseInt(jo.getString("Runtime")
							.split(" ")[0]);
					String plot = jo.getString("Plot");
					double imdbRating = Double.parseDouble(jo
							.getString("imdbRating"));
					int imdbVotes = Integer.parseInt(jo.getString("imdbVotes")
							.replace(",", ""));

					URL posterURL = new URL(jo.getString("Poster"));
					URLConnection posterConn = posterURL.openConnection();
					InputStream in = posterConn.getInputStream();
					byte[] poster = IOUtils.toByteArray(in);

					String check = "SELECT title FROM movie WHERE movie_id = '"
							+ id + "';";
					Statement checkStm = connection.createStatement();
					ResultSet checkRs = checkStm.executeQuery(check);
					if (checkRs.next() == false) { // movie does not exist

						String stm = "INSERT INTO movie (movie_id, title, year, runtime, plot, imdbrating, imdbvotes, poster) VALUES(?, ?, ?, ?, ?, ?, ?, ?)";
						PreparedStatement pst = connection
								.prepareStatement(stm);
						pst.setString(1, id);
						pst.setString(2, actual_title);
						pst.setInt(3, year);
						pst.setInt(4, runtime);
						pst.setString(5, plot);
						pst.setDouble(6, imdbRating);
						pst.setInt(7, imdbVotes);
						pst.setBytes(8, poster);
						pst.executeUpdate();

						String[] actors = jo.getString("Actors").split(", ");
						for (int i = 0; i < actors.length; i++) {
							String[] name = actors[i].split(" ");

							String actorCheck = "SELECT person_id FROM person WHERE firstname='"
									+ name[0]
									+ "' AND lastname='"
									+ name[1]
									+ "';";
							checkStm = connection.createStatement();
							ResultSet actorCheckRs = checkStm
									.executeQuery(actorCheck);
							long actorId;
							if (actorCheckRs.next() == true) {
								actorId = actorCheckRs.getLong(1);
							} else {
								String astm = "INSERT INTO person(firstname, lastname) VALUES(?, ?)";
								PreparedStatement apst = connection
										.prepareStatement(astm,
												Statement.RETURN_GENERATED_KEYS);
								apst.setString(1, name[0]);
								apst.setString(2, name[1]);
								apst.executeUpdate();
								ResultSet generatedId = apst.getGeneratedKeys();
								generatedId.next();
								actorId = generatedId.getLong(1);
							}

							//
							String mastm = "INSERT INTO movie_actor(movie_id, actor_id) VALUES(?, ?)";
							PreparedStatement mapst = connection
									.prepareStatement(mastm);
							mapst.setString(1, id);
							mapst.setLong(2, actorId);
							mapst.executeUpdate();

						}

						String[] directors = jo.getString("Director").split(
								", ");
						for (int i = 0; i < directors.length; i++) {
							String[] name = directors[i].split(" ");

							String directorCheck = "SELECT person_id FROM person WHERE firstname='"
									+ name[0]
									+ "' AND lastname='"
									+ name[1]
									+ "';";
							checkStm = connection.createStatement();
							ResultSet directorCheckRs = checkStm
									.executeQuery(directorCheck);
							long directorId;
							if (directorCheckRs.next() == true) {
								directorId = directorCheckRs.getLong(1);
							} else {
								String astm = "INSERT INTO person(firstname, lastname) VALUES(?, ?)";
								PreparedStatement apst = connection
										.prepareStatement(astm,
												Statement.RETURN_GENERATED_KEYS);
								apst.setString(1, name[0]);
								apst.setString(2, name[1]);
								apst.executeUpdate();
								ResultSet generatedId = apst.getGeneratedKeys();
								generatedId.next();
								directorId = generatedId.getLong(1);
							}
							//
							String mastm = "INSERT INTO movie_director(movie_id, director_id) VALUES(?, ?)";
							PreparedStatement mapst = connection
									.prepareStatement(mastm);
							mapst.setString(1, id);
							mapst.setLong(2, directorId);
							mapst.executeUpdate();
						}
						
						String[] genres = jo.getString("Genre").split(", ");
						
						for (int i = 0; i < genres.length; i++) {
							String genreCheck = "SELECT genre_id FROM genre WHERE name = '" + genres[i] + "';";
							checkStm = connection.createStatement();
							ResultSet genreCheckRs = checkStm.executeQuery(genreCheck);
							long genreId;
							if (genreCheckRs.next() == true) {
								genreId = genreCheckRs.getLong(1);
							} else {
								String gstm = "INSERT INTO genre(name) VALUES(?)";
								PreparedStatement gpst = connection.prepareStatement(gstm, Statement.RETURN_GENERATED_KEYS);
								gpst.setString(1, genres[i]);
								gpst.executeUpdate();
								ResultSet generatedId = gpst.getGeneratedKeys();
								generatedId.next();
								genreId = generatedId.getLong(1);
							}
							
							String mgstm = "INSERT INTO movie_genre(movie_id, genre_id) VALUES(?, ?)";
							PreparedStatement mgpst = connection
									.prepareStatement(mgstm);
							mgpst.setString(1, id);
							mgpst.setLong(2, genreId);
							mgpst.executeUpdate();
						}
					}
				} catch (Exception e) {
					System.out.println(e);
				}
			}

			conn.disconnect();
		}
		// close postgres db
		connection.close();
	}
}
